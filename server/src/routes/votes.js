const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");
const { generatePollPDF } = require("../utils/pdfGenerator");
const {
  voteLimiter,
  adminLimiter,
  pdfLimiter,
  validatePagination,
  validateSearch,
} = require("../middleware/security");

/**
 * Helper function to normalize Arabic text for uniqueness check
 */
const normalizeArabicText = (text) => {
  if (!text) return text;

  // Convert to Unicode Normalization Form C (NFC)
  let normalized = text.normalize("NFC");

  // Remove Arabic diacritics (tashkeel) - optional
  normalized = normalized.replace(/[\u064B-\u065F]/g, "");

  // Remove extra whitespace
  normalized = normalized.trim().replace(/\s+/g, " ");

  // Convert to lowercase for case-insensitive comparison
  return normalized.toLowerCase();
};

// Submit a vote
router.post("/vote", voteLimiter, async (req, res) => {
  try {
    const { name, phone, answer, language = "en" } = req.body;

    // Validate required fields
    if (!name || !phone || !answer) {
      const message =
        language === "ar" ? "جميع الحقول مطلوبة" : "All fields are required";
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Validate phone format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, "");
    if (!phoneRegex.test(cleanedPhone)) {
      const message =
        language === "ar"
          ? "صيغة رقم الهاتف غير صالحة"
          : "Invalid phone number format";
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Check for duplicate phone number
    const existingVoteByPhone = await Vote.findOne({
      phone: cleanedPhone,
    });

    if (existingVoteByPhone) {
      const message =
        language === "ar"
          ? "رقم الهاتف هذا تم استخدامه للتصويت مسبقاً"
          : "A vote with this phone number already exists";
      return res.status(409).json({
        success: false,
        message: message,
      });
    }

    // Check for duplicate name (using normalization)
    const normalizedName = normalizeArabicText(name);

    // Get all existing votes to check for normalized names
    const allVotes = await Vote.find({});
    let duplicateNameFound = false;
    let duplicateName = "";

    for (const vote of allVotes) {
      const normalizedExisting = normalizeArabicText(vote.name);
      if (normalizedName === normalizedExisting) {
        duplicateNameFound = true;
        duplicateName = vote.name;
        break;
      }
    }

    if (duplicateNameFound) {
      const message =
        language === "ar"
          ? `الاسم '${name}' (أو اسم مشابه بالعربية) تم استخدامه مسبقاً`
          : `Name '${name}' (or a similar Arabic name) has already been used`;
      return res.status(409).json({
        success: false,
        message: message,
      });
    }

    // Validate answer
    const allowedAnswers = ["Yes", "No"];
    if (!allowedAnswers.includes(answer)) {
      const message =
        language === "ar" ? "إجابة غير صالحة" : "Invalid answer selection";
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Create new vote
    const vote = new Vote({
      name: name.trim(),
      phone: cleanedPhone,
      answer,
      createdAt: new Date(),
    });

    await vote.save();

    const successMessage =
      language === "ar"
        ? "تم إرسال التصويت بنجاح"
        : "Vote submitted successfully";

    res.status(201).json({
      success: true,
      message: successMessage,
      data: vote,
    });
  } catch (error) {
    console.error("Error submitting vote:", error);

    // Handle duplicate key error for phone (MongoDB unique constraint)
    if (error.code === 11000) {
      const message =
        req.body.language === "ar"
          ? "رقم الهاتف هذا تم استخدامه للتصويت مسبقاً"
          : "A vote with this phone number already exists";
      return res.status(409).json({
        success: false,
        message: message,
      });
    }

    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      const message =
        req.body.language === "ar"
          ? `خطأ في التحقق: ${messages.join(", ")}`
          : `Validation error: ${messages.join(", ")}`;
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Handle custom error messages
    if (
      error.message &&
      (error.message.includes("already taken") ||
        error.message.includes("مستخدم"))
    ) {
      const message =
        req.body.language === "ar"
          ? `الاسم '${req.body.name}' (أو اسم مشابه بالعربية) تم استخدامه مسبقاً`
          : `Name '${req.body.name}' (or a similar Arabic name) has already been used`;
      return res.status(409).json({
        success: false,
        message: message,
      });
    }

    // Generic error
    const message =
      req.body.language === "ar"
        ? "حدث خطأ أثناء إرسال التصويت"
        : "An error occurred while submitting the vote";

    res.status(500).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get all votes with filters
router.get("/votes", adminLimiter, validatePagination, validateSearch, async (req, res) => {
  try {
    const { answer, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    // Filter by answer
    if (answer && answer !== "all") {
      query.answer = answer;
    }

    // Search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const votes = await Vote.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Vote.countDocuments(query);

    res.json({
      success: true,
      data: votes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching votes",
    });
  }
});

// Get vote statistics
router.get("/stats", adminLimiter, async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();

    // Get breakdown by answer
    const breakdown = await Vote.aggregate([
      {
        $group: {
          _id: "$answer",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get votes per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Vote.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalVotes,
        breakdown,
        dailyStats,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

// Export results as PDF
router.get('/export/pdf', pdfLimiter, validateSearch, async (req, res) => {
  try {
    const { 
      language = 'en', 
      answer, 
      search, 
      page = 1, 
      limit = 1000 
    } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // Filter by answer
    if (answer && answer !== 'all' && answer !== 'الكل') {
      query.answer = answer;
    }
    
    // Search by name or phone
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination for large datasets
    const skip = (page - 1) * limit;
    
    // Get votes with filters (no pagination for PDF, or use high limit)
    const votes = await Vote.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for statistics
    const totalVotes = await Vote.countDocuments(query);
    
    // Prepare poll info with filter details
    const pollInfo = {
      title: language === 'ar' ? 'نتائج التصويت' : 'Poll Results',
      totalVotes: totalVotes,
      filteredVotes: votes.length,
      filters: {
        answer: answer || (language === 'ar' ? 'الكل' : 'all'),
        search: search || '',
        language: language
      },
      generatedAt: new Date(),
    };
    
    // Generate PDF
    const pdfBuffer = await generatePollPDF(votes, pollInfo, { language });
    
    // Set filename based on filters
    let filename = language === 'ar' 
      ? 'نتائج-التصويت' 
      : 'poll-results';
    
    const today = new Date().toISOString().split('T')[0];
    filename += `-${today}`;
    
    if (search || (answer && answer !== 'all' && answer !== 'الكل')) {
      filename += '-filtered';
    }
    
    filename += '.pdf';
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // // Optional: Cache control headers
    // res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    // res.setHeader('Pragma', 'no-cache');
    // res.setHeader('Expires', '0');
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
});

module.exports = router;

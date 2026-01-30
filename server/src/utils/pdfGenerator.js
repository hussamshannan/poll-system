const PDFDocument = require("pdfkit");
const path = require("path");

/**
 * Security: Sanitize text input to prevent PDF injection attacks
 * Removes potentially harmful characters and limits length
 */
const sanitizeText = (text, maxLength = 200) => {
  if (!text || typeof text !== "string") return "";

  // Remove control characters and normalize whitespace
  let sanitized = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Limit length to prevent DoS
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "...";
  }

  return sanitized;
};

/**
 * Validate phone number format
 */
const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "N/A";

  // Remove all non-digit and non-plus characters
  const sanitized = phone.replace(/[^\d\+\-\(\)\s]/g, "").trim();

  // Limit length
  return sanitized.substring(0, 20);
};

/**
 * Validate and sanitize date
 */
const sanitizeDate = (date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleDateString();
    }
    return d.toLocaleDateString();
  } catch {
    return new Date().toLocaleDateString();
  }
};

/**
 * Bilingual translations
 */
const translations = {
  ar: {
    title: "نتائج التصويت",
    subtitle: "رابطة معاشيي بنك السودان المركزي",
    totalVotes: "إجمالي الأصوات",
    filteredVotes: "الأصوات المفلترة",
    voteBreakdown: "تفصيل الأصوات",
    votes: "صوت",
    voterDetails: "تفاصيل الناخبين",
    name: "الاسم",
    phone: "الهاتف",
    answer: "الإجابة",
    date: "التاريخ",
    generatedOn: "تم الإنشاء في",
    page: "صفحة",
    of: "من",
    yes: "نعم",
    no: "لا",
    statistics: "الإحصائيات",
    percentage: "النسبة المئوية",
    filters: "الفلاتر",
    searchTerm: "كلمة البحث",
    filterBy: "تصفية حسب",
    all: "الكل",
  },
  en: {
    title: "Poll Results",
    subtitle: "Central Bank of Sudan Retirees Association",
    totalVotes: "Total Votes",
    filteredVotes: "Filtered Votes",
    voteBreakdown: "Vote Breakdown",
    votes: "votes",
    voterDetails: "Voter Details",
    name: "Name",
    phone: "Phone",
    answer: "Answer",
    date: "Date",
    generatedOn: "Generated on",
    page: "Page",
    of: "of",
    yes: "Yes",
    no: "No",
    statistics: "Statistics",
    percentage: "Percentage",
    filters: "Filters",
    searchTerm: "Search Term",
    filterBy: "Filter by",
    all: "All",
  },
};

/**
 * Color palette for modern design
 */
const colors = {
  primary: "#1976d2",
  primaryDark: "#115293",
  secondary: "#dc004e",
  success: "#4caf50",
  warning: "#ff9800",
  text: "#212121",
  textLight: "#757575",
  border: "#e0e0e0",
  background: "#f5f5f5",
  white: "#ffffff",
  yesColor: "#4caf50",
  noColor: "#f44336",
  tableEven: "#f9f9f9",
  tableOdd: "#ffffff",
};

/**
 * Check if text contains Arabic characters
 */
const isArabic = (text) => {
  return /[\u0600-\u06FF]/.test(text);
};

/**
 * Draw a modern header with gradient-like effect
 */
const drawHeader = (doc, t, isRTL) => {
  const pageWidth = doc.page.width;

  // Header background (gradient effect with rectangles)
  doc.save();
  doc.rect(0, 0, pageWidth, 120).fill(colors.primary);
  doc.rect(0, 100, pageWidth, 20).fill(colors.primaryDark);
  doc.restore();

  // Title
  doc.fillColor(colors.white);
  doc.font(isRTL ? "Arabic-Bold" : "English-Bold")
     .fontSize(28)
     .text(t.title, 0, 30, {
       align: "center",
       width: pageWidth
     });

  // Subtitle
  doc.font(isRTL ? "Arabic" : "English")
     .fontSize(14)
     .fillColor("#e3f2fd")
     .text(t.subtitle, 0, 70, {
       align: "center",
       width: pageWidth
     });

  doc.fillColor(colors.text);
  return 140; // Return Y position after header
};

/**
 * Draw statistics cards
 */
const drawStatistics = (doc, votes, pollInfo, t, isRTL, startY) => {
  const cardWidth = 160;
  const cardHeight = 80;
  const spacing = 20;
  const totalCards = 2;
  const totalWidth = (cardWidth * totalCards) + (spacing * (totalCards - 1));
  const startX = (doc.page.width - totalWidth) / 2;

  const cards = [
    {
      title: t.totalVotes,
      value: pollInfo.totalVotes || votes.length,
      color: colors.primary,
      icon: "📊",
    },
    {
      title: t.filteredVotes,
      value: pollInfo.filteredVotes || votes.length,
      color: colors.secondary,
      icon: "🔍",
    },
  ];

  let currentX = startX;

  cards.forEach((card) => {
    // Card shadow
    doc.save();
    doc.fillColor("#00000015")
       .rect(currentX + 2, startY + 2, cardWidth, cardHeight)
       .fill();
    doc.restore();

    // Card background
    doc.save();
    doc.fillColor(colors.white)
       .strokeColor(colors.border)
       .lineWidth(1)
       .rect(currentX, startY, cardWidth, cardHeight)
       .fillAndStroke();
    doc.restore();

    // Card accent bar
    doc.save();
    doc.fillColor(card.color)
       .rect(currentX, startY, cardWidth, 4)
       .fill();
    doc.restore();

    // Card content
    doc.fillColor(colors.textLight)
       .font(isRTL ? "Arabic" : "English")
       .fontSize(10)
       .text(card.title, currentX + 15, startY + 20, {
         width: cardWidth - 30,
         align: "left",
       });

    doc.fillColor(card.color)
       .font(isRTL ? "Arabic-Bold" : "English-Bold")
       .fontSize(24)
       .text(card.value.toString(), currentX + 15, startY + 40, {
         width: cardWidth - 30,
         align: "left",
       });

    currentX += cardWidth + spacing;
  });

  return startY + cardHeight + 30;
};

/**
 * Draw vote breakdown chart (text-based bars)
 */
const drawVoteBreakdown = (doc, votes, t, isRTL, startY) => {
  // Section title
  doc.fillColor(colors.text)
     .font(isRTL ? "Arabic-Bold" : "English-Bold")
     .fontSize(16)
     .text(t.voteBreakdown, 50, startY);

  let y = startY + 30;

  // Calculate breakdown
  const voteBreakdown = votes.reduce((acc, vote) => {
    acc[vote.answer] = (acc[vote.answer] || 0) + 1;
    return acc;
  }, {});

  const total = votes.length || 1;

  // Draw bars for each option
  Object.entries(voteBreakdown).forEach(([option, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    const barWidth = (percentage / 100) * 400;
    const color = option === "Yes" ? colors.yesColor : colors.noColor;

    // Option label
    doc.fillColor(colors.text)
       .font(isRTL ? "Arabic" : "English")
       .fontSize(12)
       .text(`${option}`, 50, y);

    // Bar background
    doc.save();
    doc.fillColor(colors.background)
       .rect(150, y, 400, 20)
       .fill();
    doc.restore();

    // Bar fill
    doc.save();
    doc.fillColor(color)
       .rect(150, y, barWidth, 20)
       .fill();
    doc.restore();

    // Percentage text
    doc.fillColor(colors.text)
       .font(isRTL ? "Arabic-Bold" : "English-Bold")
       .fontSize(10)
       .text(`${count} ${t.votes} (${percentage}%)`, 155, y + 5);

    y += 35;
  });

  return y + 10;
};

/**
 * Draw filters info if applied
 */
const drawFiltersInfo = (doc, pollInfo, t, isRTL, startY) => {
  const filters = pollInfo.filters || {};

  // Only show if filters are applied
  if (!filters.answer || (filters.answer === 'all' || filters.answer === 'الكل')) {
    if (!filters.search || filters.search.trim() === '') {
      return startY;
    }
  }

  // Filters title
  doc.fillColor(colors.text)
     .font(isRTL ? "Arabic-Bold" : "English-Bold")
     .fontSize(12)
     .text(t.filters + ":", 50, startY);

  let y = startY + 20;

  // Filter by answer
  if (filters.answer && filters.answer !== 'all' && filters.answer !== 'الكل') {
    doc.fillColor(colors.textLight)
       .font(isRTL ? "Arabic" : "English")
       .fontSize(10)
       .text(`${t.filterBy}: ${filters.answer}`, 70, y);
    y += 15;
  }

  // Search term
  if (filters.search && filters.search.trim() !== '') {
    const sanitizedSearch = sanitizeText(filters.search, 50);
    doc.fillColor(colors.textLight)
       .font(isRTL ? "Arabic" : "English")
       .fontSize(10)
       .text(`${t.searchTerm}: ${sanitizedSearch}`, 70, y);
    y += 15;
  }

  return y + 10;
};

/**
 * Draw table with voter details
 */
const drawTable = (doc, votes, t, isRTL, startY) => {
  // Security: Limit number of rows to prevent DoS
  const MAX_ROWS = 1000;
  const limitedVotes = votes.slice(0, MAX_ROWS);

  if (limitedVotes.length < votes.length) {
    console.warn(`PDF generation limited to ${MAX_ROWS} rows for security`);
  }

  // Section title
  doc.fillColor(colors.text)
     .font(isRTL ? "Arabic-Bold" : "English-Bold")
     .fontSize(16)
     .text(t.voterDetails, 50, startY);

  let y = startY + 30;

  // Table dimensions
  const tableLeft = 50;
  const tableWidth = doc.page.width - 100;
  const colWidths = isRTL
    ? [100, 100, 100, tableWidth - 300] // Date, Answer, Phone, Name (RTL)
    : [tableWidth - 300, 100, 100, 100]; // Name, Phone, Answer, Date (LTR)

  const rowHeight = 30;
  const headerHeight = 35;

  // Table header
  const headers = isRTL
    ? [t.date, t.answer, t.phone, t.name]
    : [t.name, t.phone, t.answer, t.date];

  // Header background
  doc.save();
  doc.fillColor(colors.primary)
     .rect(tableLeft, y, tableWidth, headerHeight)
     .fill();
  doc.restore();

  // Header text
  let currentX = tableLeft;
  headers.forEach((header, index) => {
    doc.fillColor(colors.white)
       .font(isRTL ? "Arabic-Bold" : "English-Bold")
       .fontSize(11)
       .text(
         header,
         currentX + 10,
         y + 10,
         { width: colWidths[index] - 20, align: isRTL ? "right" : "left" }
       );
    currentX += colWidths[index];
  });

  y += headerHeight;

  // Table rows
  limitedVotes.forEach((vote, index) => {
    // Security: Sanitize all user inputs
    const sanitizedName = sanitizeText(vote.name, 100);
    const sanitizedPhone = sanitizePhone(vote.phone);
    const sanitizedAnswer = sanitizeText(vote.answer, 10);
    const sanitizedDate = sanitizeDate(vote.createdAt);

    // Check for page break
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }

    // Alternating row colors
    const rowColor = index % 2 === 0 ? colors.tableEven : colors.tableOdd;
    doc.save();
    doc.fillColor(rowColor)
       .rect(tableLeft, y, tableWidth, rowHeight)
       .fill();
    doc.restore();

    // Row border
    doc.save();
    doc.strokeColor(colors.border)
       .lineWidth(0.5)
       .rect(tableLeft, y, tableWidth, rowHeight)
       .stroke();
    doc.restore();

    // Cell data
    const cellData = isRTL
      ? [sanitizedDate, sanitizedAnswer, sanitizedPhone, sanitizedName]
      : [sanitizedName, sanitizedPhone, sanitizedAnswer, sanitizedDate];

    currentX = tableLeft;
    cellData.forEach((data, cellIndex) => {
      // Determine if cell content is Arabic
      const cellIsArabic = isArabic(data);
      const font = cellIsArabic ? "Arabic" : "English";

      doc.fillColor(colors.text)
         .font(font)
         .fontSize(9)
         .text(
           data,
           currentX + 10,
           y + 10,
           {
             width: colWidths[cellIndex] - 20,
             align: isRTL || cellIsArabic ? "right" : "left",
             ellipsis: true,
           }
         );
      currentX += colWidths[cellIndex];
    });

    y += rowHeight;
  });

  return y + 20;
};

/**
 * Draw footer with page numbers
 */
const drawFooter = (doc, t, isRTL, pageNum, totalPages) => {
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  // Footer line
  doc.save();
  doc.strokeColor(colors.border)
     .lineWidth(1)
     .moveTo(50, pageHeight - 60)
     .lineTo(pageWidth - 50, pageHeight - 60)
     .stroke();
  doc.restore();

  // Generated date
  const generatedDate = new Date().toLocaleString(isRTL ? "ar" : "en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.fillColor(colors.textLight)
     .font(isRTL ? "Arabic" : "English")
     .fontSize(8)
     .text(
       `${t.generatedOn}: ${generatedDate}`,
       50,
       pageHeight - 50,
       { align: isRTL ? "right" : "left" }
     );

  // Page number
  doc.fillColor(colors.textLight)
     .font(isRTL ? "Arabic" : "English")
     .fontSize(8)
     .text(
       `${t.page} ${pageNum} ${t.of} ${totalPages}`,
       0,
       pageHeight - 50,
       { align: "center", width: pageWidth }
     );
};

/**
 * Generate modern bilingual PDF with poll results
 * @param {Array} votes - Array of vote documents
 * @param {Object} pollInfo - Poll information
 * @param {Object} options - Generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
const generatePollPDF = (votes, pollInfo = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Security: Validate inputs
      if (!Array.isArray(votes)) {
        return reject(new Error("Votes must be an array"));
      }

      // Security: Limit total votes to prevent DoS
      const MAX_VOTES = 10000;
      if (votes.length > MAX_VOTES) {
        return reject(new Error(`Maximum ${MAX_VOTES} votes allowed per PDF`));
      }

      // Get language from options
      const language = options.language === "ar" ? "ar" : "en";
      const isRTL = language === "ar";
      const t = translations[language];

      // Create PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true,
        autoFirstPage: false,
      });

      const buffers = [];

      // Register fonts with error handling
      try {
        const arabicFontPath = path.join(
          __dirname,
          "../assets/fonts/Rubik/static/Rubik-Regular.ttf"
        );
        const arabicBoldFontPath = path.join(
          __dirname,
          "../assets/fonts/Rubik/static/Rubik-Bold.ttf"
        );
        const englishFontPath = path.join(
          __dirname,
          "../assets/fonts/Inter/static/Inter_28pt-Regular.ttf"
        );
        const englishBoldFontPath = path.join(
          __dirname,
          "../assets/fonts/Inter/static/Inter_28pt-Bold.ttf"
        );

        doc.registerFont("Arabic", arabicFontPath);
        doc.registerFont("Arabic-Bold", arabicBoldFontPath);
        doc.registerFont("English", englishFontPath);
        doc.registerFont("English-Bold", englishBoldFontPath);
      } catch (fontError) {
        console.error("Font loading error:", fontError);
        return reject(new Error("Failed to load required fonts"));
      }

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.on("error", (error) => {
        reject(error);
      });

      // Add first page
      doc.addPage();

      // Draw header
      let currentY = drawHeader(doc, t, isRTL);

      // Draw statistics cards
      currentY = drawStatistics(doc, votes, pollInfo, t, isRTL, currentY);

      // Draw vote breakdown
      currentY = drawVoteBreakdown(doc, votes, t, isRTL, currentY);

      // Draw filters info
      currentY = drawFiltersInfo(doc, pollInfo, t, isRTL, currentY);

      // Add some spacing before table
      currentY += 20;

      // Draw voter details table
      drawTable(doc, votes, t, isRTL, currentY);

      // Add page numbers to all pages
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, t, isRTL, i + 1, pages.count);
      }

      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
};

module.exports = { generatePollPDF };

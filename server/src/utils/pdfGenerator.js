const PDFDocument = require("pdfkit");
const path = require("path");
const arabicReshaper = require("arabic-reshaper");
const bidi = require("bidi-js");

/* ---------------- RTL ARABIC SUPPORT ---------------- */

const formatArabic = (text) => {
  if (!text) return "";
  const reshaped = arabicReshaper.reshape(text);
  return bidi.fromString(reshaped).toString();
};

const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

const formatTextByLang = (text, isRTL) => {
  const clean = sanitizeText(text);
  if (isRTL && isArabic(clean)) return formatArabic(clean);
  return clean;
};

/* ---------------- SECURITY HELPERS ---------------- */

const sanitizeText = (text, maxLength = 200) => {
  if (!text || typeof text !== "string") return "";
  let sanitized = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (sanitized.length > maxLength)
    sanitized = sanitized.substring(0, maxLength) + "...";
  return sanitized;
};

const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "N/A";
  return phone
    .replace(/[^\d\+\-\(\)\s]/g, "")
    .trim()
    .substring(0, 20);
};

const sanitizeDate = (date) => {
  try {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? new Date().toLocaleDateString()
      : d.toLocaleDateString();
  } catch {
    return new Date().toLocaleDateString();
  }
};

/* ---------------- TRANSLATIONS ---------------- */

const translations = {
  /* SAME AS YOUR ORIGINAL — unchanged for brevity */
};
const colors = {
  /* SAME AS YOUR ORIGINAL — unchanged for brevity */
};

/* ---------------- HEADER ---------------- */

const drawHeader = (doc, t, isRTL) => {
  const pageWidth = doc.page.width;

  doc.rect(0, 0, pageWidth, 120).fill(colors.primary);
  doc.rect(0, 100, pageWidth, 20).fill(colors.primaryDark);

  doc
    .fillColor(colors.white)
    .font(isRTL ? "Arabic-Bold" : "English-Bold")
    .fontSize(28)
    .text(formatTextByLang(t.title, isRTL), 0, 30, {
      align: "center",
      width: pageWidth,
    });

  doc
    .font(isRTL ? "Arabic" : "English")
    .fontSize(14)
    .fillColor("#e3f2fd")
    .text(formatTextByLang(t.subtitle, isRTL), 0, 70, {
      align: "center",
      width: pageWidth,
    });

  doc.fillColor(colors.text);
  return 140;
};

/* ---------------- VOTE BREAKDOWN ---------------- */

const drawVoteBreakdown = (doc, votes, t, isRTL, startY) => {
  doc
    .fillColor(colors.text)
    .font(isRTL ? "Arabic-Bold" : "English-Bold")
    .fontSize(16)
    .text(formatTextByLang(t.voteBreakdown, isRTL), 50, startY);

  let y = startY + 30;
  const voteBreakdown = votes.reduce((acc, vote) => {
    acc[vote.answer] = (acc[vote.answer] || 0) + 1;
    return acc;
  }, {});
  const total = votes.length || 1;

  Object.entries(voteBreakdown).forEach(([option, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    const barWidth = (percentage / 100) * 400;
    const color = option === "Yes" ? colors.yesColor : colors.noColor;

    if (isRTL) {
      const pageWidth = doc.page.width;
      doc
        .font("Arabic")
        .fontSize(12)
        .fillColor(colors.text)
        .text(formatTextByLang(option, true), pageWidth - 150, y, {
          align: "right",
          width: 100,
        });

      doc.fillColor(colors.background).rect(50, y, 400, 20).fill();
      doc
        .fillColor(color)
        .rect(450 - barWidth, y, barWidth, 20)
        .fill();

      doc
        .fillColor(colors.text)
        .font("Arabic-Bold")
        .fontSize(10)
        .text(
          formatTextByLang(`${count} ${t.votes} (${percentage}%)`, true),
          50,
          y + 5,
          { align: "right", width: 400 },
        );
    } else {
      doc
        .font("English")
        .fontSize(12)
        .fillColor(colors.text)
        .text(option, 50, y);
      doc.fillColor(colors.background).rect(150, y, 400, 20).fill();
      doc.fillColor(color).rect(150, y, barWidth, 20).fill();
      doc
        .fillColor(colors.text)
        .font("English-Bold")
        .fontSize(10)
        .text(`${count} ${t.votes} (${percentage}%)`, 155, y + 5);
    }
    y += 35;
  });
  return y + 10;
};

/* ---------------- FILTERS ---------------- */

const drawFiltersInfo = (doc, pollInfo, t, isRTL, startY) => {
  const filters = pollInfo.filters || {};
  if (
    (!filters.answer ||
      filters.answer === "all" ||
      filters.answer === "الكل") &&
    (!filters.search || filters.search.trim() === "")
  )
    return startY;

  doc
    .font(isRTL ? "Arabic-Bold" : "English-Bold")
    .fontSize(12)
    .fillColor(colors.text)
    .text(formatTextByLang(t.filters, isRTL) + ":", 50, startY);

  let y = startY + 20;

  if (filters.answer && filters.answer !== "all" && filters.answer !== "الكل") {
    doc
      .font(isRTL ? "Arabic" : "English")
      .fontSize(10)
      .fillColor(colors.textLight)
      .text(formatTextByLang(`${t.filterBy}: ${filters.answer}`, isRTL), 70, y);
    y += 15;
  }

  if (filters.search?.trim()) {
    doc.text(
      formatTextByLang(
        `${t.searchTerm}: ${sanitizeText(filters.search, 50)}`,
        isRTL,
      ),
      70,
      y,
    );
    y += 15;
  }

  return y + 10;
};

/* ---------------- TABLE + FOOTER (RTL APPLIED SAME WAY) ---------------- */
/* To keep this message readable, logic is identical to yours,
   ONLY change is wrapping any displayed text with formatTextByLang() */

/* ---------------- MAIN GENERATOR ---------------- */

const generatePollPDF = (votes, pollInfo = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(votes))
        return reject(new Error("Votes must be an array"));
      if (votes.length > 10000)
        return reject(new Error("Maximum 10000 votes allowed"));

      const language = options.language === "ar" ? "ar" : "en";
      const isRTL = language === "ar";
      const t = translations[language];

      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true,
        autoFirstPage: false,
      });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc.registerFont(
        "Arabic",
        path.join(__dirname, "../assets/fonts/Rubik/static/Rubik-Regular.ttf"),
      );
      doc.registerFont(
        "Arabic-Bold",
        path.join(__dirname, "../assets/fonts/Rubik/static/Rubik-Bold.ttf"),
      );
      doc.registerFont(
        "English",
        path.join(__dirname, "../assets/fonts/Inter/static/Inter-Regular.ttf"),
      );
      doc.registerFont(
        "English-Bold",
        path.join(__dirname, "../assets/fonts/Inter/static/Inter-Bold.ttf"),
      );

      doc.addPage();

      let currentY = drawHeader(doc, t, isRTL);
      currentY = drawVoteBreakdown(doc, votes, t, isRTL, currentY);
      currentY = drawFiltersInfo(doc, pollInfo, t, isRTL, currentY);
      currentY += 20;

      drawTable(doc, votes, t, isRTL, currentY);

      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, t, isRTL, i + 1, pages.count);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePollPDF };

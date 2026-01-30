const PDFDocument = require("pdfkit");
const path = require("path");

/**
 * Generate PDF with poll results
 * @param {Array} votes - Array of vote documents
 * @param {Object} pollInfo - Poll information
 * @returns {Buffer} PDF buffer
 */
const generatePollPDF = (votes, pollInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      // 🔹 Register Arabic font (for names only)
      const arabicFontPath = path.join(
        __dirname,
        "../assets/fonts/Rubik/static/Rubik-Regular.ttf"
      );
      const englishFontPath = path.join(
        __dirname,
        "../assets/fonts/Inter/static/Inter_28pt-Regular.ttf"
      );
      doc.registerFont("Arabic", arabicFontPath);
      doc.registerFont("English", englishFontPath);

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Poll title
      doc
        .font("Helvetica")
        .fontSize(20)
        .text(pollInfo.title || "Poll Results", { align: "center" });
      doc.moveDown();

      // Total votes
      doc.fontSize(14).text(`Total Votes: ${votes.length}`);
      doc.moveDown();

      // Calculate vote breakdown
      const voteBreakdown = votes.reduce((acc, vote) => {
        acc[vote.answer] = (acc[vote.answer] || 0) + 1;
        return acc;
      }, {});

      // Vote breakdown section
      doc.fontSize(16).text("Vote Breakdown:");
      doc.moveDown(0.5);

      Object.entries(voteBreakdown).forEach(([option, count]) => {
        const percentage = ((count / votes.length) * 100).toFixed(1);
        doc
          .fontSize(12)
          .text(`${option}: ${count} votes (${percentage}%)`, { indent: 20 });
      });

      doc.moveDown();

      // Voter details table
      doc.fontSize(16).text("Voter Details:");
      doc.moveDown(0.5);

      // Table headers
      const tableTop = doc.y;
      const nameX = 50;
      const phoneX = 200;
      const answerX = 300;
      const dateX = 400;

      // Headers
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Name", nameX, tableTop);
      doc.text("Phone", phoneX, tableTop);
      doc.text("Answer", answerX, tableTop);
      doc.text("Date", dateX, tableTop);

      // Line under headers
      doc
        .moveTo(50, doc.y + 0)
        .lineTo(550, doc.y + 5)
        .stroke();

      let y = tableTop + 20;

      // Table rows
      votes.forEach((vote) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        const isArabic = /[\u0600-\u06FF]/.test(vote.name);

        const displayName = isArabic
          ? vote.name.split(" ").reverse().join(" ") // reverse words for Arabic
          : vote.name;
        doc.font("Arabic").fontSize(9);

        doc.text(displayName, nameX, y, {
          width: phoneX - nameX - 10,
        });
 

        // 🔹 Switch back to default font
        doc.font("English").fontSize(9);
        doc.text(vote.phone, phoneX, y);
        doc.text(vote.answer, answerX, y);
        doc.text(new Date(vote.createdAt).toLocaleDateString(), dateX, y);

        y += 20;
      });

      // Footer
      doc.page.margins.bottom = 50;
      const pageHeight = doc.page.height;
      doc
        .fontSize(8)
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          50,
          pageHeight - 50
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePollPDF };

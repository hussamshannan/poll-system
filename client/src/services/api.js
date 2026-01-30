// services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/* ===========================
   Vote-related API calls
=========================== */
export const voteApi = {
  submitVote: (voteData) => api.post("/vote", voteData),

  getVotes: (params) => api.get("/votes", { params }),

  getStats: () => api.get("/stats"),

  exportPDF: (filters = {}) =>
    api.get("/export/pdf", {
      params: filters,
      responseType: "blob",
      timeout: 60000,
    }),
};

/* ===========================
   Force PDF Download
=========================== */
export const downloadPDF = async (filters = {}) => {
  try {
    const response = await voteApi.exportPDF(filters);

    if (!response || !response.data) {
      throw new Error("No PDF data received");
    }

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    if (!blob.size) {
      throw new Error("Empty PDF file");
    }

    // Try to read filename from backend headers
    let filename = "poll-results.pdf";
    const disposition = response.headers?.["content-disposition"];

    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
    } else {
      const date = new Date().toISOString().split("T")[0];
      filename = `poll-results-${date}.pdf`;
    }

    const url = window.URL.createObjectURL(blob);

    // Create hidden anchor and force download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 200);

    return {
      success: true,
      filename,
      size: blob.size,
    };
  } catch (error) {
    console.error("PDF download failed:", error);

    let message = "Failed to download PDF";

    if (error.code === "ECONNABORTED") {
      message = "PDF generation timed out";
    } else if (error.response?.status === 404) {
      message = "PDF service not found";
    } else if (error.response?.status === 500) {
      message = "Server error while generating PDF";
    }

    throw new Error(message);
  }
};

export default api;

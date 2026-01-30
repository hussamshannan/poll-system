import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { voteApi, downloadPDF } from "../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLanguage } from "../contexts/LanguageContext"; // Make sure to create this context

const AdminPanel = () => {
  const { language, toggleLanguage } = useLanguage();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    answer: "all",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 0,
    total: 0,
    pages: 0,
  });

  // Bilingual content
  const content = {
    ar: {
      title: "📊 إدارة نتائج التصويت",
      searchLabel: "البحث بالاسم أو الهاتف",
      filterLabel: "التصفية حسب الإجابة",
      filterOptions: ["الكل", "Yes", "No"],
      refresh: "تحديث",
      exportPDF: "تصدير PDF",
      exporting: "جاري التصدير...",
      total: "الإجمالي",
      votes: "صوت",
      tableHeaders: ["الاسم", "رقم الهاتف", "الإجابة", "وقت التصويت"],
      noVotes: "لم يتم العثور على أصوات",
      rowsPerPage: "عدد الصفوف في الصفحة:",
      displayedRows: ({ from, to, count }) => `${from}-${to} من ${count}`,
      errors: {
        fetchFailed: "فشل في جلب الأصوات",
        exportFailed: "فشل في تصدير PDF",
        exportSuccess: "تم تصدير PDF بنجاح!",
      },
    },
    en: {
      title: "📊 Poll Results Management",
      searchLabel: "Search by name or phone",
      filterLabel: "Filter by Answer",
      filterOptions: ["All", "Yes", "No"],
      refresh: "Refresh",
      exportPDF: "Export PDF",
      exporting: "Exporting...",
      total: "Total",
      votes: "votes",
      tableHeaders: ["Name", "Phone Number", "Answer", "Voted At"],
      noVotes: "No votes found",
      rowsPerPage: "Rows per page:",
      displayedRows: ({ from, to, count }) => `${from}-${to} of ${count}`,
      errors: {
        fetchFailed: "Failed to fetch votes",
        exportFailed: "Failed to export PDF",
        exportSuccess: "PDF exported successfully!",
      },
    },
  };

  const current = content[language];
  const isRTL = language === "ar";
  const fontFamily = isRTL ? "'Rubik', sans-serif" : "'Inter', sans-serif";

  const fetchVotes = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: filters.page,
      };

      // Remove 'All' from answer filter
      if (
        params.answer === "all" ||
        params.answer === "All" ||
        params.answer === "الكل"
      ) {
        delete params.answer;
      }

      const response = await voteApi.getVotes(params);

      if (response.data.success) {
        setVotes(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(current.errors.fetchFailed);
      console.error("Error fetching votes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [filters.page, filters.answer]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "search" ? 1 : prev.page, // Reset to first page when searching
    }));
  };

  const handleSearch = () => {
    fetchVotes();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Prepare filter parameters for PDF export
      const exportFilters = {
        answer:
          filters.answer === "all" || filters.answer === "الكل"
            ? ""
            : filters.answer,
        search: filters.search.trim(),
        language: language,
        // Include pagination info for debugging
        page: 1, // Always export from page 1 with current filters
        limit: 1000, // Set a high limit to get all filtered records
      };

      const result = await downloadPDF(exportFilters);
      console.log("PDF downloaded successfully:", result);

      toast.success(current.errors.exportSuccess, {
        duration: 4000,
        style: {
          background: "#4caf50",
          color: "white",
        },
      });
    } catch (error) {
      console.error("PDF export error:", error);

      // Show specific error message
      const errorMessage = error.message || current.errors.exportFailed;
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: "#f44336",
          color: "white",
        },
      });
    } finally {
      setExporting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  const formatDate = (dateString) => {
    try {
      const locale = language === "ar" ? ar : enUS;
      const formatString =
        language === "ar" ? "dd MMM, yyyy HH:mm" : "MMM dd, yyyy HH:mm";
      return format(new Date(dateString), formatString, { locale });
    } catch (error) {
      return dateString;
    }
  };

  // Map answer values for display
  const getDisplayAnswer = (answer) => {
    if (language === "ar") {
      return answer === "Yes" ? "نعم" : "لا";
    }
    return answer;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card
        elevation={3}
        sx={{
          mb: 3,
          direction: isRTL ? "rtl" : "ltr",
          textAlign: isRTL ? "right" : "left",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" gutterBottom fontFamily={fontFamily}>
              {current.title}
            </Typography>
            <Typography>
              <IconButton onClick={toggleLanguage} color="primary">
                <LanguageIcon />
              </IconButton>
            </Typography>
          </Box>
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ mb: 3 }}
            direction={isRTL ? "row-reverse" : "row"}
          >
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={current.searchLabel}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                InputProps={{
                  style: {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
                InputLabelProps={{
                  style: {
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel
                  style={{
                    textAlign: isRTL ? "right" : "left",
                    fontFamily: fontFamily,
                  }}
                >
                  {current.filterLabel}
                </InputLabel>
                <Select
                  value={filters.answer}
                  onChange={(e) => handleFilterChange("answer", e.target.value)}
                  label={current.filterLabel}
                  inputProps={{
                    style: {
                      textAlign: isRTL ? "right" : "left",
                      fontFamily: fontFamily,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                      },
                    },
                  }}
                >
                  {current.filterOptions.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      style={{
                        textAlign: isRTL ? "right" : "left",
                        fontFamily: fontFamily,
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: isRTL ? "flex-start" : "flex-end",
                flexWrap: "wrap",
              }}
            >
              <Tooltip title={current.refresh}>
                <IconButton onClick={fetchVotes} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                color="secondary"
                startIcon={
                  exporting ? <CircularProgress size={20} /> : <DownloadIcon />
                }
                onClick={handleExportPDF}
                disabled={exporting || votes.length === 0}
                sx={{
                  fontFamily: fontFamily,
                  fontSize: "1rem",
                }}
              >
                {exporting ? current.exporting : current.exportPDF}
              </Button>

              <Chip
                label={`${current.total}: ${pagination.total} ${current.votes}`}
                color="primary"
                variant="outlined"
                sx={{
                  fontFamily: fontFamily,
                }}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {current.tableHeaders.map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        textAlign: isRTL ? "right" : "left",
                        fontFamily: fontFamily,
                        fontWeight: "bold",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : votes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography fontFamily={fontFamily}>
                        {current.noVotes}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  votes.map((vote) => (
                    <TableRow key={vote._id}>
                      <TableCell
                        sx={{
                          textAlign: isRTL ? "right" : "left",
                          fontFamily: fontFamily,
                          direction: "rtl", // Force RTL for Arabic names
                        }}
                      >
                        {vote.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: isRTL ? "right" : "left",
                          fontFamily: fontFamily,
                        }}
                        dir="ltr"
                      >
                        {vote.phone}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: isRTL ? "right" : "left",
                          fontFamily: fontFamily,
                        }}
                      >
                        <Chip
                          label={getDisplayAnswer(vote.answer)}
                          color="primary"
                          size="small"
                          sx={{
                            fontFamily: fontFamily,
                            minWidth: "60px",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: isRTL ? "right" : "left",
                          fontFamily: fontFamily,
                        }}
                      >
                        {formatDate(vote.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={filters.limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={current.rowsPerPage}
            labelDisplayedRows={current.displayedRows}
            sx={{
              direction: "ltr", // Keep pagination controls LTR (numbers are LTR)
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontFamily: fontFamily,
                },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPanel;

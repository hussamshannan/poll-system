// App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import { Toaster } from "react-hot-toast";
import LanguageIcon from "@mui/icons-material/Language";
import VoteForm from "./components/VoteForm";
import AdminPanel from "./components/AdminPanel";
import Results from "./components/Results";
import { voteApi } from "./services/api";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

// Create RTL theme for Arabic
const rtlTheme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "'Rubik', sans-serif",
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// Create LTR theme for English
const ltrTheme = createTheme({
  direction: "ltr",
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function AppContent() {
  const { language, toggleLanguage } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  const theme = language === "ar" ? rtlTheme : ltrTheme;
  const isRTL = language === "ar";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await voteApi.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Bilingual content for main app
  const appContent = {
    ar: {
      title: "رابطة معاشيي بنك السودان المركزي",
      home: "الرئيسية",
      admin: "الإدارة",
      tabs: ["التصويت", "النتائج"],
    },
    en: {
      title: "Central Bank of Sudan Retirees Association",
      home: "Home",
      admin: "Admin",
      tabs: ["Cast Your Vote", "View Results"],
    },
  };

  const currentAppContent = appContent[language];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box dir={isRTL ? "rtl" : "ltr"}>
        <Router>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {currentAppContent.title}
              </Typography>
              <IconButton color="inherit" onClick={toggleLanguage}>
                <LanguageIcon />
              </IconButton>
              <Button color="inherit" component={Link} to="/">
                {currentAppContent.home}
              </Button>
              <Button color="inherit" component={Link} to="/admin">
                {currentAppContent.admin}
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route
                path="/"
                element={
                  <Box>
                    <Tabs
                      value={currentTab}
                      onChange={handleTabChange}
                      centered
                      sx={{ mb: 3 }}
                    >
                      <Tab label={currentAppContent.tabs[0]} />
                      <Tab label={currentAppContent.tabs[1]} />
                    </Tabs>

                    {currentTab === 0 && <VoteForm />}
                    {currentTab === 1 && (
                      <Results stats={stats} isLoading={loadingStats} />
                    )}
                  </Box>
                }
              />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </Router>
      </Box>
      <Toaster position={isRTL ? "top-left" : "top-right"} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;

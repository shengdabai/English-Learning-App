import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// 页面组件
import Home from './pages/Home';
import Reading from './pages/Reading';
import Speaking from './pages/Speaking';
import Conversation from './pages/Conversation';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

// 组件
import Navigation from './components/Navigation';
import Header from './components/Header';

// 服务
import { loadUserProfile, saveUserProfile } from './services/userService';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
});

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载用户配置
    const profile = loadUserProfile();
    if (!profile) {
      // 创建新用户配置
      const newProfile = {
        level: 'beginner',
        dailyGoal: 30, // 分钟
        totalMinutes: 0,
        streak: 0,
        lastActiveDate: null,
        achievements: [],
        preferences: {
          theme: 'light',
          voiceSpeed: 1.0,
          autoPlay: true,
        },
      };
      setUserProfile(newProfile);
      saveUserProfile(newProfile);
    } else {
      setUserProfile(profile);
    }
    setLoading(false);
  }, []);

  const updateUserProfile = (updates) => {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        加载中...
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header userProfile={userProfile} />
          <Box sx={{ display: 'flex', flex: 1 }}>
            <Navigation />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Routes>
                <Route path="/" element={<Home userProfile={userProfile} />} />
                <Route
                  path="/reading"
                  element={<Reading userProfile={userProfile} updateUserProfile={updateUserProfile} />}
                />
                <Route
                  path="/speaking"
                  element={<Speaking userProfile={userProfile} updateUserProfile={updateUserProfile} />}
                />
                <Route
                  path="/conversation"
                  element={<Conversation userProfile={userProfile} updateUserProfile={updateUserProfile} />}
                />
                <Route
                  path="/progress"
                  element={<Progress userProfile={userProfile} />}
                />
                <Route
                  path="/settings"
                  element={<Settings userProfile={userProfile} updateUserProfile={updateUserProfile} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobProvider } from './JobContext';
import NavigationBar from './NavigationBar';
import HomePage from './HomePage';
import SubmitPostingPage from './SubmitPostingPage';
import AdminPage from './AdminPage';
import JobsPage from './JobsPage';
import ApplyPage from './ApplyPage';
import MyApplicationsPage from './MyApplicationsPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import JobDetailsPage from './JobDetailsPage';
import InterviewPage from './InterviewPage'; // new import
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './FirebaseAuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b5cff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0b5cff',
          color: '#fff',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#0b5cff',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#0a52e6',
          },
        },
        outlinedPrimary: {
          borderColor: '#0b5cff',
          color: '#0b5cff',
          '&:hover': {
            borderColor: '#0a52e6',
            color: '#0a52e6',
            backgroundColor: 'rgba(11,92,255,0.04)',
          },
        },
      },
    },
  },
});

export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <NavigationBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/submit" element={<SubmitPostingPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/job-details/:jobId" element={<JobDetailsPage />} />
              <Route path="/apply/:jobId" element={<ApplyPage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
              <Route path="/interview/:jobId" element={<InterviewPage />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </JobProvider>
    </AuthProvider>
  );
}

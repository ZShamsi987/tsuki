// src/ApplyPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useJobs } from './JobContext';
import { useAuth } from './FirebaseAuthContext';

const API_URL = 'http://localhost:6969'; // or your actual server

export default function ApplyPage() {
  const { jobs } = useJobs();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const job = jobs.find((j) => j._id === jobId && j.isApproved);
  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Interview mode states
  const [interviewMode, setInterviewMode] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [answers, setAnswers] = useState({});
  const [tabSwitched, setTabSwitched] = useState(false);

  // Define handleFileChange so it's available in renderContent.
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Helper function for conditional rendering without breaking hooks rules
  const renderContent = () => {
    if (!job) {
      return (
        <Container sx={{ py: 10 }}>
          <Typography>Job not found or not approved.</Typography>
          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => navigate('/jobs')}
          >
            Back to Jobs
          </Button>
        </Container>
      );
    }
    if (!isAuthenticated) {
      return (
        <Container sx={{ py: 10 }}>
          <Typography>You must be logged in to apply.</Typography>
          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </Container>
      );
    }
    if (interviewMode) {
      if (!job.aiInterviewer || !job.interviewQuestions || job.interviewQuestions.length === 0) {
        return (
          <Container sx={{ py: 10 }}>
            <Typography variant="h5">
              No AI interview available for this job.
            </Typography>
          </Container>
        );
      }
      if (tabSwitched) {
        return (
          <Container sx={{ py: 10 }}>
            <Typography variant="h4">Interview Terminated</Typography>
            <Typography>
              The interview was terminated due to tab switching.
            </Typography>
          </Container>
        );
      }
      if (!acceptedTerms) {
        return (
          <Container sx={{ py: 10 }}>
            <Typography variant="h4" gutterBottom>
              Interview Terms
            </Typography>
            <Typography sx={{ mb: 2 }}>
              By starting the interview, you agree not to seek external help.
              You have 10 minutes to complete it. Switching tabs will terminate
              the interview.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setAcceptedTerms(true)}
            >
              Accept and Start Interview
            </Button>
          </Container>
        );
      }
      return (
        <Container sx={{ py: 10 }}>
          <Typography variant="h4" gutterBottom>
            Interview for {job.title}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </Typography>
          {job.interviewQuestions.map((question, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                {index + 1}. {question}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Type your answer here..."
              />
            </Box>
          ))}
          <Button
            variant="contained"
            onClick={handleInterviewSubmit}
            disabled={timeLeft === 0}
          >
            Submit Interview
          </Button>
        </Container>
      );
    }
    // Default: render the application form
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Apply for {job.title}
        </Typography>
        <Card sx={{ mt: 3, borderRadius: 2 }} elevation={3}>
          <CardContent sx={{ p: 3 }}>
            <Box
              component="form"
              onSubmit={handleApply}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                label="Your Name"
                variant="outlined"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <TextField
                label="Your Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Additional Experience / Cover Letter"
                variant="outlined"
                multiline
                rows={4}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Upload Resume (PDF, DOC, etc.)
              </Typography>
              <Button variant="outlined" component="label">
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {resumeFile && (
                <Typography>Selected File: {resumeFile.name}</Typography>
              )}
              <Button variant="contained" type="submit" sx={{ mt: 2 }}>
                Submit Application
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  };

  // Always call hooks unconditionally

  // Interview timer effect
  useEffect(() => {
    if (interviewMode && acceptedTerms && timeLeft > 0 && !tabSwitched) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleInterviewSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [interviewMode, acceptedTerms, timeLeft, tabSwitched]);

  // Tab switch detection effect
  useEffect(() => {
    if (interviewMode && acceptedTerms) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setTabSwitched(true);
          alert('Tab switch detected. Interview terminated.');
          handleInterviewSubmit();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () =>
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [interviewMode, acceptedTerms]);

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleInterviewSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/applications/update-interview`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          userId: user.uid,
          answers: Object.values(answers),
        }),
      });
      if (response.ok) {
        alert('Interview submitted successfully!');
        navigate('/my-applications');
      } else {
        alert('Error submitting interview.');
      }
    } catch (error) {
      console.error('Error submitting interview:', error);
      alert('Error submitting interview.');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (studentName && email && (resumeText || resumeFile)) {
      try {
        const formData = new FormData();
        formData.append('jobId', job._id);
        formData.append('jobTitle', job.title);
        formData.append('userId', user.uid);
        formData.append('userName', studentName);
        formData.append('email', email);
        formData.append('resume', resumeText);
        if (resumeFile) {
          formData.append('resumeFile', resumeFile);
        }

        await fetch(`${API_URL}/applications`, {
          method: 'POST',
          body: formData,
        });

        alert(`Application submitted for ${job.title}!`);

        if (job.aiInterviewer) {
          setInterviewMode(true);
        } else {
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error submitting application: ', error);
        alert('Error submitting application.');
      }
    } else {
      alert('Please fill out all required fields (name, email, and resume).');
    }
  };

  return renderContent();
}

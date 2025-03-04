// src/InterviewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from './JobContext';
import { useAuth } from './FirebaseAuthContext';
import { Container, Typography, Button, TextField, Box } from '@mui/material';

const API_URL = 'http://localhost:6969';

export default function InterviewPage() {
  const { jobId } = useParams();
  const { jobs } = useJobs();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const job = jobs.find((j) => j._id === jobId);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [answers, setAnswers] = useState({});
  const [tabSwitched, setTabSwitched] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const checkApplication = async () => {
      try {
        const response = await fetch(`${API_URL}/applications?jobId=${jobId}&userId=${user.uid}`);
        const data = await response.json();
        if (data.length > 0) {
          setHasApplied(true);
        } else {
          alert('You need to apply to this job first.');
          navigate(`/apply/${jobId}`);
        }
      } catch (error) {
        console.error('Error checking application:', error);
        alert('Error checking application status.');
        navigate('/jobs');
      }
    };
    checkApplication();
  }, [jobId, user, isAuthenticated, navigate]);

  useEffect(() => {
    if (acceptedTerms && timeLeft > 0 && !tabSwitched) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [acceptedTerms, timeLeft, tabSwitched]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && acceptedTerms) {
        setTabSwitched(true);
        alert("Tab switch detected. Interview terminated.");
        handleSubmit();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [acceptedTerms]);

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
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

  if (!job) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h5">Job not found.</Typography>
      </Container>
    );
  }

  if (!job.aiInterviewer || !job.interviewQuestions || job.interviewQuestions.length === 0) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h5">No AI interview available for this job.</Typography>
      </Container>
    );
  }

  if (!hasApplied) {
    return null; // Redirection handled by useEffect
  }

  if (!acceptedTerms) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h4" gutterBottom>Interview Terms</Typography>
        <Typography sx={{ mb: 2 }}>
          By starting the interview, you agree not to seek external help. You have 10 minutes to complete it.
          Switching tabs will terminate the interview.
        </Typography>
        <Button variant="contained" onClick={() => setAcceptedTerms(true)}>
          Accept and Start Interview
        </Button>
      </Container>
    );
  }

  if (tabSwitched) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h4">Interview Terminated</Typography>
        <Typography>The interview was terminated due to tab switching.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 10 }}>
      <Typography variant="h4" gutterBottom>Interview for {job.title}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
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
      <Button variant="contained" onClick={handleSubmit} disabled={timeLeft === 0}>
        Submit Interview
      </Button>
    </Container>
  );
}
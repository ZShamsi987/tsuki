// src/JobDetailsPage.js
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Typography, Card, CardContent, Button, Box } from '@mui/material';
import { useJobs } from './JobContext';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const { jobs } = useJobs();
  const navigate = useNavigate();

  const job = jobs.find((j) => j._id === jobId && j.isApproved);

  if (!job) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h6">Job not found or not approved.</Typography>
        <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 10 }}>
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            {job.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>
            {job.company}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Salary: {job.salary}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Location: {job.location}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {job.description}
          </Typography>
          {job.coursesWanted && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Courses Wanted: {job.coursesWanted.join(', ')}
            </Typography>
          )}
          {job.minGPA && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Minimum GPA: {job.minGPA}
            </Typography>
          )}
          {job.intendedMajor && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Intended Major: {job.intendedMajor}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              component={Link}
              to={`/apply/${job._id}`}
              variant="contained"
              size="small"
            >
              Apply Now
            </Button>
            {/* New: If AI interviewer is enabled and questions exist, show "Start Interview" button */}
            {job.aiInterviewer && job.interviewQuestions && job.interviewQuestions.length > 0 && (
              <Button
                component={Link}
                to={`/interview/${job._id}`}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Start Interview
              </Button>
            )}
            <Button variant="outlined" size="small" onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

// src/AdminPage.js
import React from 'react';
import { Container, Typography, Button, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { useJobs } from './JobContext';
import { useAuth } from './FirebaseAuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { jobs, approveJob, deleteJob } = useJobs();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Set the admin email to shamsizafir@gmail.com
  const ADMIN_EMAILS = ['shamsizafir@gmail.com', 'zshams@gmail.com', 'x@gmail.com'];

  if (!isAuthenticated || !user || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h6">You must be logged in as an admin to view this page.</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 10 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Admin Panel
      </Typography>
      <Button variant="outlined" onClick={logout}>
        Logout
      </Button>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {jobs.map((job, index) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card sx={{ p: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {job.title}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>
                  {job.company}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {job.description}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Location: {job.location}
                </Typography>
                {job.coursesWanted && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Courses Wanted: {job.coursesWanted}
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {!job.isApproved && (
                    <Button variant="contained" onClick={() => approveJob(job._id)}>
                      Approve
                    </Button>
                  )}
                  <Button variant="outlined" color="error" onClick={() => deleteJob(job._id)}>
                    Delete
                  </Button>
                </Box>
                {job.isApproved && (
                  <Typography variant="caption" color="green" sx={{ mt: 1 }}>
                    Approved
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}

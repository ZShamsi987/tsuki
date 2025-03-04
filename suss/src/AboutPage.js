// src/AboutPage.js
import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`about-tabpanel-${index}`}
      aria-labelledby={`about-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `about-tab-${index}`,
    'aria-controls': `about-tabpanel-${index}`,
  };
}

export default function AboutPage() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container sx={{ py: 10 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
        About Mavex
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
         A website for South Brunswick High School’s guidance department so students can easily search job postings and employers can easily submit them.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="About tabs">
          <Tab label="Students" {...a11yProps(0)} />
          <Tab label="Employers" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          For Students
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          On the Sign Up page, you can add multiple courses by typing the course name and clicking the <strong>add button</strong>. Fields marked with an asterisk (<strong>*</strong>) are required. Similarly, you can add your preferred roles.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          When applying for a job, you can upload your resume as a file (PDF, DOC, etc.) or type your additional experience/cover letter into the provided text area.
        </Typography>
        <Typography variant="body1">
          On the Jobs page, you can filter postings by location, salary range, and “My Matches” – which uses your GPA, courses, and preferred roles to show the best fit. If an employer has enabled the AI Interviewer, you’ll be taken through a 10‑minute interview session that locks you into the page.
        </Typography>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          For Employers
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          On the Submit Posting page, you can create a new job posting by filling in required fields such as Job Title, Company, Location, Salary (annual or hourly), and Description. You can add multiple roles and courses by typing a value and clicking the <strong>add button</strong>.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          If you enable the AI Interviewer toggle, the system will automatically generate interview questions based on your job description. These questions are then used when a student applies and takes an AI interview.
        </Typography>
        <Typography variant="body1">
          Additionally, the admin dashboard allows an administrator to approve or delete job postings, ensuring that only quality jobs are visible to students.
        </Typography>
      </TabPanel>
    </Container>
  );
}

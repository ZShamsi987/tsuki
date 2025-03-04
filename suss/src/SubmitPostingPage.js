// src/SubmitPostingPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  IconButton,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Switch
} from '@mui/material';
import { motion } from 'framer-motion';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { useJobs } from './JobContext';

export default function SubmitPostingPage() {
  const { addJob } = useJobs();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Salary fields
  const [salaryType, setSalaryType] = useState('annual'); // "annual" or "hourly"
  const [salaryValue, setSalaryValue] = useState('');

  const [coursesWanted, setCoursesWanted] = useState([]);
  const [newCourse, setNewCourse] = useState('');

  const [rolesWanted, setRolesWanted] = useState([]);
  const [newRole, setNewRole] = useState('');

  const [minGPA, setMinGPA] = useState('');
  const [intendedMajor, setIntendedMajor] = useState('');

  // New toggle for AI Interviewer
  const [aiInterviewer, setAiInterviewer] = useState(false);

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setCoursesWanted((prev) => [...prev, newCourse.trim()]);
      setNewCourse('');
    }
  };
  const handleRemoveCourse = (index) => {
    setCoursesWanted((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRole = () => {
    if (newRole.trim()) {
      setRolesWanted((prev) => [...prev, newRole.trim()]);
      setNewRole('');
    }
  };
  const handleRemoveRole = (index) => {
    setRolesWanted((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalSalary = '';
    if (salaryValue) {
      if (salaryType === 'annual') {
        finalSalary = `$${salaryValue}/year`;
      } else {
        finalSalary = `$${salaryValue}/hr`;
      }
    }

    if (title && company && description && location && finalSalary) {
      await addJob(
        title,
        company,
        description,
        location,
        finalSalary,
        coursesWanted,
        rolesWanted,
        minGPA,
        intendedMajor,
        aiInterviewer  // Pass the new toggle value
      );
      alert('Job posting submitted!');
      navigate('/jobs');
    } else {
      alert('Please fill out all required fields (including salary).');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Create a Job Posting
        </Typography>
      </motion.div>
      <Card
        component={motion.div}
        sx={{ mt: 3, p: 3, borderRadius: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Job Details
            </Typography>
            <TextField
              label="Job Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Company"
              variant="outlined"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Location"
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              required
            />

            <FormControl>
              <FormLabel>Compensation Type</FormLabel>
              <RadioGroup row value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
                <FormControlLabel value="annual" control={<Radio />} label="Annual Salary" />
                <FormControlLabel value="hourly" control={<Radio />} label="Hourly Wage" />
              </RadioGroup>
            </FormControl>
            <TextField
              label={salaryType === 'annual' ? 'Annual Salary' : 'Hourly Wage'}
              variant="outlined"
              type="number"
              value={salaryValue}
              onChange={(e) => setSalaryValue(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Job Description"
              variant="outlined"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
            />

            <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
              Candidate Requirements
            </Typography>

            {/* Roles wanted */}
            <Box>
              <Typography variant="subtitle1">Roles Wanted</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  label="Add a role"
                  variant="outlined"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton color="primary" onClick={handleAddRole}>
                  <AddCircleOutline />
                </IconButton>
              </Box>
              <Box sx={{ mt: 1 }}>
                {rolesWanted.map((r, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography>{r}</Typography>
                    <IconButton size="small" color="error" onClick={() => handleRemoveRole(index)}>
                      <RemoveCircleOutline />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Courses wanted */}
            <Box>
              <Typography variant="subtitle1">Courses Wanted/Required</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  label="Add a course"
                  variant="outlined"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton color="primary" onClick={handleAddCourse}>
                  <AddCircleOutline />
                </IconButton>
              </Box>
              <Box sx={{ mt: 1 }}>
                {coursesWanted.map((c, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography>{c}</Typography>
                    <IconButton size="small" color="error" onClick={() => handleRemoveCourse(index)}>
                      <RemoveCircleOutline />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            <TextField
              label="Minimum GPA"
              variant="outlined"
              value={minGPA}
              onChange={(e) => setMinGPA(e.target.value)}
              fullWidth
            />
            <TextField
              label="Intended Major"
              variant="outlined"
              value={intendedMajor}
              onChange={(e) => setIntendedMajor(e.target.value)}
              fullWidth
            />

            {/* New toggle for AI Interviewer */}
            <FormControlLabel
              control={
                <Switch
                  checked={aiInterviewer}
                  onChange={(e) => setAiInterviewer(e.target.checked)}
                />
              }
              label="Enable AI Interviewer"
            />

            <motion.div whileHover={{ scale: 1.02 }}>
              <Button variant="contained" type="submit" fullWidth sx={{ py: 1.5 }}>
                Submit Posting
              </Button>
            </motion.div>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

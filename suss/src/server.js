// src/server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 6969;
console.log('MONGODB_URI =>', process.env.MONGODB_URI);
console.log('PORT =>', PORT);

app.use(cors());
app.use(express.json());

// Multer setup for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, 'resume-' + uniqueSuffix);
  },
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Models
const User = require('./user');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  location: String,
  salary: String,
  coursesWanted: [String],
  rolesWanted: [String],
  minGPA: String,
  intendedMajor: String,
  isApproved: { type: Boolean, default: false },
  aiInterviewer: { type: Boolean, default: false },
  interviewQuestions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});
const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
  jobId: String,
  jobTitle: String,
  userId: String,
  userName: String,
  email: String,
  resume: String,
  resumeFilePath: String,
  appliedAt: Date,
  interviewAnswers: { type: [String], default: [] },
});
const Application = mongoose.model('Application', applicationSchema);

// Routes
app.get('/users/uid/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { firebaseUid, email, role, gpa, courses, preferredRoles } = req.body;
    let user = await User.findOne({ firebaseUid });
    if (!user) user = new User({ firebaseUid, email });
    if (role) user.role = role;
    if (gpa) user.gpa = gpa;
    if (courses) user.courses = courses;
    if (preferredRoles) user.preferredRoles = preferredRoles;
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/jobs', async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      salary,
      coursesWanted,
      rolesWanted,
      minGPA,
      intendedMajor,
      aiInterviewer,
    } = req.body;

    const newJob = new Job({
      title,
      company,
      description,
      location,
      salary,
      coursesWanted,
      rolesWanted,
      minGPA,
      intendedMajor,
      aiInterviewer,
    });
    await newJob.save();
    console.log("New job created:", newJob);

    if (aiInterviewer) {
      console.log("AI Interviewer enabled. Generating interview questions...");
      const { generateInterviewQuestions } = require('./aiInterview');
      const questions = await generateInterviewQuestions(description);
      newJob.interviewQuestions = questions;
      await newJob.save();
      console.log("Interview questions saved for job:", newJob._id);
    }

    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/jobs/:id/approve', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/applications', upload.single('resumeFile'), async (req, res) => {
  try {
    const { jobId, jobTitle, userId, userName, email, resume } = req.body;
    let resumeFilePath = '';
    if (req.file) resumeFilePath = '/uploads/resumes/' + req.file.filename;

    const newApp = new Application({
      jobId,
      jobTitle,
      userId,
      userName,
      email,
      resume: resume || '',
      resumeFilePath,
      appliedAt: new Date(),
    });
    await newApp.save();
    return res.status(201).json(newApp);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/applications', async (req, res) => {
  try {
    const { userId, jobId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (jobId) filter.jobId = jobId;
    const applications = await Application.find(filter).sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/applications/update-interview', async (req, res) => {
  try {
    const { jobId, userId, answers } = req.body;
    const application = await Application.findOneAndUpdate(
      { jobId, userId },
      { interviewAnswers: answers },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
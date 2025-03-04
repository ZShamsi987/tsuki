// src/JobContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const JobContext = createContext();
const API_URL = 'http://localhost:6969';

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const addJob = async (
    title,
    company,
    description,
    location,
    salary,
    coursesWanted,
    rolesWanted,
    minGPA,
    intendedMajor,
    aiInterviewer
  ) => {
    try {
      await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      fetchJobs();
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const approveJob = async (id) => {
    try {
      await fetch(`${API_URL}/jobs/${id}/approve`, {
        method: 'PUT',
      });
      fetchJobs();
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const deleteJob = async (id) => {
    try {
      await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
      });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, approveJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
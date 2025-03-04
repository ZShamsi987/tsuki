// src/NavigationBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from './FirebaseAuthContext';

export default function NavigationBar() {
  const { isAuthenticated, logout, user } = useAuth();

  // Admin check by email
  const isAdmin = user && ['shamsizafir@gmail.com'].includes(user.email);
  // user.role => "student" or "employer" or null
  const userRole = user?.role;

  return (
    <AppBar position="static" color="default">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: 'none', color: '#fff', fontWeight: 600 }}
        >
          Mavex
        </Typography>
        <div>
          {/* Always show the About link */}
          <Button component={Link} to="/about" sx={{ color: '#fff', mr: 2 }}>
            About
          </Button>
          {/* Admin => show everything */}
          {isAuthenticated && isAdmin && (
            <>
              <Button component={Link} to="/submit" sx={{ color: '#fff', mr: 2 }}>
                Submit Posting
              </Button>
              <Button component={Link} to="/jobs" sx={{ color: '#fff', mr: 2 }}>
                Jobs
              </Button>
              <Button component={Link} to="/my-applications" sx={{ color: '#fff', mr: 2 }}>
                My Applications
              </Button>
              <Button component={Link} to="/admin" sx={{ color: '#fff', mr: 2 }}>
                Admin Dashboard
              </Button>
            </>
          )}

          {/* Employer => "Submit Posting" + "Jobs" */}
          {isAuthenticated && !isAdmin && userRole === 'employer' && (
            <>
              <Button component={Link} to="/submit" sx={{ color: '#fff', mr: 2 }}>
                Submit Posting
              </Button>
              <Button component={Link} to="/jobs" sx={{ color: '#fff', mr: 2 }}>
                Jobs
              </Button>
            </>
          )}

          {/* Student => "Jobs" + "My Applications" */}
          {isAuthenticated && !isAdmin && userRole === 'student' && (
            <>
              <Button component={Link} to="/jobs" sx={{ color: '#fff', mr: 2 }}>
                Jobs
              </Button>
              <Button component={Link} to="/my-applications" sx={{ color: '#fff', mr: 2 }}>
                My Applications
              </Button>
            </>
          )}

          {/* If user is logged in => logout, else => login */}
          {isAuthenticated ? (
            <Button sx={{ color: '#fff' }} onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button component={Link} to="/login" sx={{ color: '#fff' }}>
              Login
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

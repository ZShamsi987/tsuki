// deleteAllTestUsers.js
const admin = require('firebase-admin');

// Set the Auth emulator host (adjust the port if needed)
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize Firebase Admin with an explicit projectId for emulator use.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'zafircode'  // Use a dummy project ID for emulator testing.
});

async function deleteAllUsers() {
  try {
    // List all users in the emulator
    const listUsersResult = await admin.auth().listUsers();
    const deletionPromises = listUsersResult.users.map(userRecord =>
      admin.auth().deleteUser(userRecord.uid)
    );
    await Promise.all(deletionPromises);
    console.log('All test users deleted.');
  } catch (error) {
    console.error('Error deleting users:', error);
  }
}

deleteAllUsers();

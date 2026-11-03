require('dotenv').config(); // To use environment variables from .env

const User = require('./models/userModel');
const connectDB = require('./config/db');

// ONE-TIME CLEANUP: removes the name and password fields left over from
// password-based logins, and lowercases emails to match the user schema

const removeNamesAndPasswords = async () => {
  try {
    await connectDB();

    const result = await User.collection.updateMany({}, [
      { $set: { email: { $toLower: { $trim: { input: '$email' } } } } },
      { $unset: ['name', 'password', 'passwordResetToken', 'passwordResetExpires'] },
    ]);
    console.log(`Cleaned up ${result.modifiedCount} of ${result.matchedCount} users.`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

removeNamesAndPasswords();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Book = require('../models/bookModel');
const sendEmail = require('../utils/email');

// sessions stay valid on a browser until they expire or the user logs out
const SESSION_LENGTH = '183d';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: SESSION_LENGTH,
  });
};

// Create a new single-use verification token and email the sign-in link to the user
const sendLoginLink = async (user) => {
  const verificationToken = user.createEmailVerificationToken();
  await user.save();

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const message = `<p>Hi,</p>
<p>Please click the link below to sign in to Comic Collective on this browser:</p>
<p><a href="${verificationURL}">${verificationURL}</a></p>
<p>This link can only be used once and expires in 24 hours.</p>
<p>If you did not request this, please ignore this email.</p>`;

  await sendEmail({
    email: user.email,
    subject: 'Comic Collective - Your Sign-in Link',
    message,
  });
};

// Create a new user with the given role and send them a sign-in link
const createUserAndSendLink = async (req, res, role) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter an email address' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ email, role });

  try {
    await sendLoginLink(user);
    res.status(201).json({ message: `Registration successful! A verification link has been sent to ${user.email}.` });
  } catch (err) {
    res.status(500).json({ message: 'There was an error sending the verification email. Please try again later.' });
  }
};

// @desc    Register a new customer
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  await createUserAndSendLink(req, res, 'customer');
});

// @desc    Register a new employee
// @route   POST /api/users/register-employee
// @access  Private/Employee
const registerEmployee = asyncHandler(async (req, res) => {
  await createUserAndSendLink(req, res, 'employee');
});

// @desc    Email a sign-in link to an existing user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter an email address' });
  }

  // Send the same response either way to prevent email enumeration
  const genericMessage = 'If an active account exists for that email, a sign-in link has been sent to it.';
  const user = await User.findOne({ email });

  if (!user || user.status !== 'active') {
    return res.status(200).json({ message: genericMessage });
  }

  try {
    await sendLoginLink(user);
    res.status(200).json({ message: genericMessage });
  } catch (err) {
    res.status(500).json({ message: 'There was an error sending the sign-in email. Please try again later.' });
  }
});

// @desc    Verify a sign-in link and start a session on this browser
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'No verification token found.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ emailVerificationToken: hashedToken });

  if (!user) {
    return res.status(400).json({ message: 'This link is invalid or has already been used. Please sign in again to get a new link.' });
  }

  // tokens are single use, so clear it whether or not it has expired
  const expired = user.emailVerificationExpires < Date.now();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  if (expired) {
    await user.save();
    return res.status(400).json({ message: 'This link has expired. Please sign in again to get a new link.' });
  }

  if (user.status !== 'active') {
    await user.save();
    return res.status(401).json({ message: 'Account is disabled' });
  }

  user.isVerified = true;
  await user.save();

  res.status(200).json({
    _id: user.id,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Send a new sign-in link to a user
// @route   POST /api/users/:id/send-login-link
// @access  Private/Employee
const resendLoginLink = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    await sendLoginLink(user);
    res.status(200).json({ message: `A new verification link has been sent to ${user.email}.` });
  } catch (err) {
    res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Employee
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Employee
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Employee
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.email = req.body.email || user.email;
    user.status = req.body.status || user.status;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Employee
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(user);
});

// @desc    Add a book to user's pull list
// @route   POST /api/users/me/pull-list
// @access  Private/Customer
const addPullRequest = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const user = await User.findById(req.user.id);

  if (user) {
    // ensure book is not already in pull list
    const alreadyPulled = user.pullList.some(item => item.bookId.toString() === bookId);

    if (alreadyPulled) {
      return res.status(400).json({ message: 'Book already in pull list' });
    }

    user.pullList.push({ bookId, requested: true, pulled: false, purchased: false });
    await user.save();

    res.status(201).json(user.pullList);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Remove a book from user's pull list
// @route   POST /api/users/me/pull-drop
// @access  Private/Customer
const dropPullRequest = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const user = await User.findById(req.user.id);

  if (user) {
    // ensure book is in pull list
    const alreadyPulled = user.pullList.some(item => item.bookId.toString() === bookId);

    if (!alreadyPulled) {
      return res.status(400).json({ message: 'Book not in pull list' });
    }

    user.pullList = user.pullList.filter(item => item.bookId.toString() !== bookId);
    await user.save();

    res.status(200).json(user.pullList);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


// @desc    Get user pull list
// @route   GET /api/users/pull-list
// @access  Private
const getUserPullList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'pullList.bookId',
    model: 'Book',
  });

  if (user) {
    res.json(user.pullList);
  } else {
    res.status(404).send('User not found');
  }
});

// @desc    Get all pull lists from all users
// @route   GET /api/users/pull-list/all
// @access  Private/Employee
const getAllUsersPullList = asyncHandler(async (req, res) => {
  // gather details of all books for all users' pull lists
  const users = await User.find({ 'pullList.0': { $exists: true } }) // get only non-empty pull lists
    .populate({
      path: 'pullList.bookId',
      model: 'Book'
    })
    .select('email pullList');

  if (users) {
    // flatten the array of pull lists
    // into a single array of pull items
    // with user info for each item
    const allPulls = users.flatMap(user =>
      user.pullList.map(pull => ({
        ...pull.toObject(), // have to convert mongoose sub-document to object
        userId: user._id,
        userEmail: user.email,
      }))
    );
    res.json(allPulls);
  } else {
    res.json([]);
  }
});

// @desc    Mark a pull request as purchased
// @route   PUT /api/users/pull-list/:pullId/purchase
// @access  Private/Employee
const purchasePullRequest = asyncHandler(async (req, res) => {
  const { pullId } = req.params;

  // find pullId and store which user it belongs to
  const user = await User.findOne({ 'pullList._id': pullId });

  if (!user) {
    res.status(404);
    throw new Error('Pull item not found');
  }

  const pullItem = user.pullList.id(pullId);

  if (pullItem.purchased) {
    res.status(400);
    throw new Error('Item already purchased');
  }

  // find book and check inventory BEFORE marking as purchased
  const book = await Book.findById(pullItem.bookId);
  if (!book) {
    res.status(404);
    throw new Error('Associated book not found for this pull item.');
  }

  if (book.inventory < 1) {
    res.status(400);
    throw new Error(`Cannot purchase "${book.seriesTitle}": Not enough inventory.`);
  }

  // Now, proceed with updates
  book.inventory -= 1;
  await book.save();

  pullItem.purchased = true;
  await user.save();

  res.status(200).json({ message: 'Pull item marked as purchased' });
});

// @desc    Mark a pull request as pulled
// @route   PUT /api/users/pull-list/:pullId/pull
// @access  Private/Employee
const markPullAsPulled = asyncHandler(async (req, res) => {
  const { pullId } = req.params;

  // find pullId and store which user it belongs to
  const user = await User.findOne({ 'pullList._id': pullId });

  if (!user) {
    res.status(404);
    throw new Error('Pull item not found');
  }

  const pullItem = user.pullList.id(pullId);
  pullItem.pulled = true;
  await user.save();

  res.status(200).json({ message: 'Pull item marked as pulled' });
});

// @desc    Get recommendation tags based on user's pull list
// @route   GET /api/users/me/recommendation-tags
// @access  Private/Customer
const getRecommendationTags = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'pullList.bookId',
    select: 'tags', // only selects 'tags' field for efficiency
    model: 'Book',
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const allTags = user.pullList.flatMap(item => item.bookId ? item.bookId.tags : []);
  const uniqueTags = [...new Set(allTags)];
  res.json(uniqueTags);
});

module.exports = { registerUser, loginUser, verifyEmail, resendLoginLink, registerEmployee, getUsers, getUserById, updateUser, deleteUser, getMe, addPullRequest, dropPullRequest, getUserPullList, getAllUsersPullList, purchasePullRequest, markPullAsPulled, getRecommendationTags };

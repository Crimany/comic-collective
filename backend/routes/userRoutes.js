const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  resendLoginLink,
  loginUser,
  registerEmployee,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  addPullRequest,
  dropPullRequest,
  getUserPullList,
  getAllUsersPullList,
  purchasePullRequest,
  markPullAsPulled,
  getRecommendationTags
} = require('../controllers/userController');
const { protect, employee, customer } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.get('/me', protect, getMe);
router.get('/me/recommendation-tags', protect, customer, getRecommendationTags);
router.get('/pull-list', protect, getUserPullList);

// Employee only routes
router.post('/register-employee', protect, employee, registerEmployee);
router.get('/pull-list/all', protect, employee, getAllUsersPullList);
router.route('/')
    .get(protect, employee, getUsers);
router.route('/:id')
    .get(protect, employee, getUserById)
    .put(protect, employee, updateUser)
    .delete(protect, employee, deleteUser);
router.post('/:id/send-login-link', protect, employee, resendLoginLink);
router.put('/pull-list/:pullId/pull', protect, employee, markPullAsPulled);
router.put('/pull-list/:pullId/purchase', protect, employee, purchasePullRequest);

// Customer only routes
router.post('/me/pull-list', protect, customer, addPullRequest);
router.post('/me/pull-drop', protect, customer, dropPullRequest);
 
module.exports = router;

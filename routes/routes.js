const express = require('express');
const authController = require('../controllers/auth');
const postController = require('../controllers/post');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.get('/posts/:pageCount', postController.getFeed)
//get all posts by all users

router.post('/posts', isAuth, postController.newPost);
//create a new post

router.put('/posts/:postId', isAuth, postController.editPost);
//edit a specific post by Id

router.post('/posts/:postId/newComment', isAuth, postController.newComment);
//Add a new comment

//router.put('/posts/:postId/editComment', isAuth, postController.editComment);

router.delete('/posts/:postId', isAuth, postController.deletePost);

router.post('/login', authController.login);
//attempt to login

router.post('/users', authController.signup);
//attempt to create a new user

router.get('/users', postController.getUserList);
//get all users

router.get('/users/:userId', postController.getUserPage)
//get a specific user

router.put('/users/:userId', postController.editUserInfo)


module.exports = router;
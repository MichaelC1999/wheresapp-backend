const Post = require('../models/post');
const User = require('../models/user');
const uploadCloudinary = require('../util/uploadCloudinary');

updateUser = async (post, userId) => {
    
    const user = await User.findById(userId)
    user.posts.push(post._id);
    
    await user.save()
}

exports.getFeed = async (req, res, next) => {
    const page = req.params.pageCount;
    try { 
        const posts = await Post.find().skip((page) *3).limit(3).sort({"createdAt": "desc"}).populate('creator');
        if(!posts){
            const error = Error("No posts found")
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Posts found', posts: posts});
    } catch (err) {
        console.log(err);
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

exports.newPost = async (req, res, next) => {
    const title = req.body.title;
    const desc = req.body.desc;
    const location = req.body.location;
    const userId = req.body.userId;

    
    
    console.log(req.body, req.file)
    try {

        
        if(!title || !desc || !location || !userId){
            const error = Error('Did not receive sufficient data to create a post.');
            error.statusCode = 409;
            throw error
        }

        if(!req.file){
            const error = Error('Image upload error! No image file received!');
            error.statusCode = 417;
            throw error
        }

        const imagePath = await uploadCloudinary(req.file.path) 
        
        if(!imagePath){
            const error = Error('Image upload error! No upload URL received!');
            error.statusCode = 404;
            throw error
        }

        let post = new Post({
            title: title,
            desc: desc,
            location: location,
            imageUrl: imagePath,
            creator: userId
        })
        
        
        await post.save();
        updateUser(post, userId);

        res.status(201).json({
            message: 'Post created sucessfully',
            post: post
        })
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
}

exports.getUserList = async (req, res, next) => {
    
    let users;
    try {
        users = await User.find();
        if(!users){
            const error = Error('No users found!');
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({message: "users fetched", users: users});

    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
}

exports.getUserPage = async (req, res, next) => {
    const getPageByUserId = req.params.userId;
    
    let user;
    // let posts;
    
    try {
        user = await User.findById(getPageByUserId).populate('posts');
        if(!user){
            const error = Error("No user found");
            error.statusCode = 404;
            throw error;
        }

        
        res.status(200).json({message: "UserPage data loaded", user: user});
    } catch (err) {

        if(!err.statusCode){
            console.log(err)
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.editUserInfo = async (req, res, next) => {
    const bio = req.body.bio;

    try {
        const user = await User.findById(req.params.userId);

        user.bio = bio;

        await user.save();

        res.status(200).json({message: "User bio updated", user: user});

    } catch (err) {
        if(!err.statusCode){
            console.log(err)
            err.statusCode = 500;
        }
        next(err);
    }
    
}

exports.editPost = async (req, res, next) => {
    const postId = req.params.postId;
    console.log(req.body, req.file)
    //get post, attach updated info
    //does it include a new image file? if so, upload. if not, use legacy photo
    
    

    try {
        
        if(!postId){
            const error = new Error('Did not receive post ID, maybe an attempt to add new post');
            error.statusCode = 409;
            throw error
        }

        const postToUpdate = await Post.findById(postId);

        if(!postToUpdate){
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error
        }
        
        if(req.body.userId !== postToUpdate.creator.toString()){
            console.log(typeof(req.body.userId), typeof(postToUpdate.creator.toString()))
            const error = new Error('You cannot edit posts by another user!');
            error.statusCode = 403;
            throw error
        }

        postToUpdate.title = req.body.title;
        postToUpdate.desc = req.body.desc;
        postToUpdate.location = req.body.location;
        //if legacy location (postToupdate) is different than new, request location, remove old post _id entry in location object, and run thru location add function
        
        //if image is uploaded, set uploaded link to postToUpdate.imageUrl
        if(!req.body.imageUrl && req.file){
            const imagePath = await uploadCloudinary(req.file.path)
            if(imagePath){
                postToUpdate.imageUrl = imagePath;
            }
        }
        
        await postToUpdate.save();
        res.status(201).json({
            message: 'Post edited sucessfully'
        })
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
    
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId)

        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error
        }
        // if(post.creator.toString() !== userId){
        //     console.log(typeof(post.creator.toString()), (req.body.userId))
        //     const error = new Error('You cannot delete posts by another user!');
        //     error.statusCode = 403;
        //     throw error
        // }
        //Check user logged in

        await Post.findByIdAndRemove(postId)
        const user = await User.findById(post.creator) 
        await user.posts.pull(postId)
        await user.save()
        

        //have post id, delete by post id
        //post.creator is _id get user by id, and delete entry with post id
        //post.location is location title, find and remove location.posts entry by id

        res.status(200).json({message: 'Post deleted'})
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}
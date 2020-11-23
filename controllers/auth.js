const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uploadCloudinary = require('../util/uploadCloudinary');

exports.signup = async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const name = req.body.name;
    let password = req.body.password;
    let user;

    console.log(req.file)

    try {

        

        const userDoc = await User.findOne({email: email})
        
        if(userDoc){
            const error = Error("Email in Use");
            error.statusCode = 422
            throw error;
        }
       
        password = await bcrypt.hash(password, 12)

        imagePath = await uploadCloudinary(req.file.path)

        user = new User({
            email: email,
            name: name,
            avatarImg: imagePath,
            password: password
        })
        user.save()
        
        const token = jwt.sign(
            {
                email: user.email, 
                userId: user._id.toString()
            }, 'secret', 
            { expiresIn: '1h'})

        res.status(201).json({message: "new user", token: token, userId: user._id})

    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    try {
        console.log(email)
        const user = await User.findOne({email: email})
        if(!user){
            const error = Error('No user found');
            error.statusCode = 404;
            throw error;
        }
        console.log(user)
        const isEqual = await bcrypt.compare(password, user.password);
        //compares input login password to stored encrypted password
    
        if(!isEqual){
            const error = new Error('Passwords do not match');
            error.statusCode = 403;
            throw error
        }

        const token = jwt.sign(
            {
                email: user.email, 
                userId: user._id.toString()
            }, 'secret', 
            { expiresIn: '1h'})

        res.status(200).json({message: 'user found', token: token, userId: user._id})

    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }   
}


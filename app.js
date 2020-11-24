const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const routes = require('./routes/routes');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

//Defining how to store files

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true)
    } else {
        cb(null, false)
    }
}



app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(bodyParser.json())

 app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
// app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
})

app.use('/', routes)

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log(message)
    res.status(status).json({message: message, data: data})
})

mongoose
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ufyip.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`)
    .then(result => {
        const server = app.listen(process.env.PORT || 5000);
        const options={
            cors:true,
            origins:"*",
           }
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('client connected')
        })
        console.log('connected')
    })
    .catch(err => console.log(err))

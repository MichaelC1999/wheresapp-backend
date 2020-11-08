const {cloudinary} = require('../cloudinary');

module.exports = async (filePath) => {
    let imagePath = ""
    
    console.log(filePath)
    try {
        const uploadedResponse = await cloudinary.uploader.upload(filePath, {
            upload_preset: 'dev_setups'
        })
        imagePath = uploadedResponse.url
        

    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
    return imagePath;
}


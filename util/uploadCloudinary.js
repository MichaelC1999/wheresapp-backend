
module.exports = async (filePath) => {

    let imagePath = ""
    
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const uploadedResponse = await cloudinary.uploader.upload(filePath, {
            upload_preset: 'dev_setups'
        })
        imagePath = uploadedResponse.url
        

    } catch(err) {
        const error = new Error(err)
        throw error
    }
    
    return imagePath;
}


const mongoose = require("mongoose")

const connection = async()=>{
  
    
    try {
        const con = await mongoose.connect(process.env.Mongoose_url )
        console.log("db connection");
        
    } catch (error) {
        console.log(error);
        
    
    }
}

module.exports = connection;
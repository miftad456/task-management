import mongoose from  "mongoose";

export const connectDB   = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log("MongoDB connected succesfully");
    }catch(err){
        console.error("MongoDB connection failed");
        process.exit(1);
    }
}
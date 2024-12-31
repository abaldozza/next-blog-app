import mongoose from "mongoose";

export const ConnectDB = async () => {
    await mongoose.connect('mongodb+srv://admin:admin123@cluster0.bqi5e.mongodb.net/blog-app');
    console.log("DB Connected");
}
import { ConnectDB } from "@/lib/config/db"
import BlogModel from "@/lib/models/BlogModel";
import { NextResponse } from "next/server"
import { writeFile } from 'fs/promises'
const fs = require('fs')

// Move DB connection to within the handler
const LoadDB = async () => {
    try {
        await ConnectDB();
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to database");
    }
}

// API Endpoint to get all blogs
export async function GET(request) {
    try {
        await LoadDB(); // Connect to DB when needed

        const searchParams = new URL(request.url).searchParams;
        const blogId = searchParams.get("id");

        if (blogId) {
            const blog = await BlogModel.findById(blogId);
            if (!blog) {
                return NextResponse.json({ error: "Blog not found" }, { status: 404 });
            }
            return NextResponse.json(blog);
        } else {
            const blogs = await BlogModel.find({});
            return NextResponse.json({ blogs });
        }
    } catch (error) {
        console.error("GET request error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// API Endpoint for Uploading Blogs
export async function POST(request) {
    try {
        await LoadDB(); // Connect to DB when needed

        const formData = await request.formData();
        const timestamp = Date.now();

        const image = formData.get('image');
        if (!image) {
            return NextResponse.json(
                { error: "Image is required" },
                { status: 400 }
            );
        }

        const imageByteData = await image.arrayBuffer();
        const buffer = Buffer.from(imageByteData);
        const path = `./public/${timestamp}_${image.name}`;
        await writeFile(path, buffer);
        const imgUrl = `/${timestamp}_${image.name}`;

        const blogData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            author: formData.get('author'),
            image: imgUrl,
            authorImg: formData.get('authorImg')
        };

        await BlogModel.create(blogData);
        console.log("Blog Saved");

        return NextResponse.json(
            { success: true, msg: "Blog Added" },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST request error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

//Creating API Endpoint to delete blogs
export async function DELETE(request) {
    const id = await request.nextUrl.searchParams.get('id');
    const blog = await BlogModel.findById(id);
    fs.unlink(`./public${blog.image}`, () => { });
    await BlogModel.findByIdAndDelete(id);
    return NextResponse.json({ msg: "Blog Deleted" })
}
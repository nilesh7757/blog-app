// models/Blog.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  images: [
    {
      url: String,
      key: String,
    },
  ],
  documents: [
    {
      url: String,
      key: String,
    },
  ],
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
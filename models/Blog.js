// models/Blog.js
import mongoose from 'mongoose';
import './User'; // Import User model to ensure it's registered

const commentSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual populate for comment author
commentSchema.virtual('authorDetails', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

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
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
blogSchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for comments count
blogSchema.virtual('commentsCount').get(function() {
  return this.comments?.length || 0;
});

// Pre-save middleware to ensure arrays are initialized
blogSchema.pre('save', function(next) {
  if (!this.likes) this.likes = [];
  if (!this.comments) this.comments = [];
  next();
});

// Add virtual populate for author details
blogSchema.virtual('authorDetails', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

// Method to check if a user has liked the blog
blogSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(like => like.toString() === userId.toString());
};

// Method to toggle like
blogSchema.methods.toggleLike = function(userId) {
  const userIdStr = userId.toString();
  const index = this.likes.findIndex(like => like.toString() === userIdStr);
  
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

// Check if the model exists before creating a new one
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
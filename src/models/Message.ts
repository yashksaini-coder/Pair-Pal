import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  linkPreview: {
    url: String,
    title: String,
    description: String,
    image: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
messageSchema.index({ matchId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
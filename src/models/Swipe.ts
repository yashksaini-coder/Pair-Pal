import mongoose, { Schema, Document } from 'mongoose';

export interface ISwipe extends Document {
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  liked: boolean;
  createdAt: Date;
}

const swipeSchema = new Schema<ISwipe>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    targetId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    liked: { 
      type: Boolean, 
      required: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Create compound index to ensure a user can only swipe on another user once
swipeSchema.index({ userId: 1, targetId: 1 }, { unique: true });

const Swipe = mongoose.models.Swipe || mongoose.model<ISwipe>('Swipe', swipeSchema);

export default Swipe;
import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  user1Id: mongoose.Types.ObjectId;
  user2Id: mongoose.Types.ObjectId;
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    user1Id: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    user2Id: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Create compound index to ensure uniqueness
matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

const Match = mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema);

export default Match;
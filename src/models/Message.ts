import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    matchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Match', 
      required: true 
    },
    senderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    receiverId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    }
  },
  { 
    timestamps: true 
  }
);

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;
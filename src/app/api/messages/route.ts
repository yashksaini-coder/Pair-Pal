import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';
import Message from '@/models/Message';

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const matchId = url.searchParams.get('matchId');
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Verify the match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' }, 
        { status: 404 }
      );
    }
    
    if (
      match.user1Id.toString() !== currentUser._id.toString() && 
      match.user2Id.toString() !== currentUser._id.toString()
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to access this match' }, 
        { status: 403 }
      );
    }
    
    // Fetch messages for this match
    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username avatarUrl');
    
    return NextResponse.json({ messages });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Parse request body
    const { matchId, content } = await req.json();
    
    if (!matchId || !content) {
      return NextResponse.json(
        { error: 'Match ID and message content are required' }, 
        { status: 400 }
      );
    }
    
    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Verify the match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' }, 
        { status: 404 }
      );
    }
    
    if (
      match.user1Id.toString() !== currentUser._id.toString() && 
      match.user2Id.toString() !== currentUser._id.toString()
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to access this match' }, 
        { status: 403 }
      );
    }
    
    // Determine the receiver
    const receiverId = 
      match.user1Id.toString() === currentUser._id.toString() 
        ? match.user2Id 
        : match.user1Id;
    
    // Create and save the message
    const message = new Message({
      matchId,
      senderId: currentUser._id,
      receiverId,
      content
    });
    
    await message.save();
    
    // Populate sender info before returning
    await message.populate('senderId', 'username avatarUrl');
    
    return NextResponse.json({ message });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' }, 
      { status: 500 }
    );
  }
}
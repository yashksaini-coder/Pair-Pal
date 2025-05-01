import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';
import Message from '@/models/Message';
import { getLinkPreview } from 'link-preview-js';
import { extractUrls } from '@/lib/extractUrls';

// Helper to get link preview data
async function getLinkPreviewData(url: string) {
  try {
    const response = await getLinkPreview(url, {
      timeout: 3000,
      followRedirects: 'follow',
      headers: {
        'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      },
    });

    if ('title' in response) {
      return {
        url,
        title: response.title || '',
        description: response.description || '',
        image: response.images?.[0] || response.favicons?.[0] || '',
      };
    }
    
    return null;
  } catch (err) {
    console.error('Error getting link preview:', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const matchId = url.searchParams.get('matchId');
    
    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }
    
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    
    if (
      match.user1Id.toString() !== currentUser._id.toString() && 
      match.user2Id.toString() !== currentUser._id.toString()
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username avatarUrl')
      .populate('reactions.userId', 'username avatarUrl');
    
    return NextResponse.json({ messages });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { matchId, content } = await req.json();
    
    if (!matchId || !content) {
      return NextResponse.json({ error: 'Match ID and content required' }, { status: 400 });
    }
    
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    
    if (
      match.user1Id.toString() !== currentUser._id.toString() && 
      match.user2Id.toString() !== currentUser._id.toString()
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const receiverId = 
      match.user1Id.toString() === currentUser._id.toString() 
        ? match.user2Id 
        : match.user1Id;
    
    // Check for URLs and get link preview
    const urls = extractUrls(content);
    let linkPreview = null;
    
    if (urls?.length > 0 && urls[0]) {
      linkPreview = await getLinkPreviewData(urls[0]);
    }
    
    const message = new Message({
      matchId,
      senderId: currentUser._id,
      receiverId,
      content,
      linkPreview
    });
    
    await message.save();
    await message.populate('senderId', 'username avatarUrl');
    
    return NextResponse.json({ message });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// Handle reactions
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { messageId, emoji } = await req.json();
    
    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji required' }, { status: 400 });
    }
    
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r: any) => 
        r.userId.toString() === currentUser._id.toString() && 
        r.emoji === emoji
    );
    
    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        (r: any) => 
          !(r.userId.toString() === currentUser._id.toString() && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        userId: currentUser._id,
        emoji
      });
    }
    
    await message.save();
    await message.populate('reactions.userId', 'username avatarUrl');
    
    return NextResponse.json({ message });
    
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 });
  }
}
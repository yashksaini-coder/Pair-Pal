import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';

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
    
    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Find matches where current user is either user1 or user2
    const matches = await Match.find({
      $or: [
        { user1Id: currentUser._id },
        { user2Id: currentUser._id }
      ]
    }).sort({ createdAt: -1 });
    
    // Get the other user info for each match
    const matchesWithUserInfo = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = 
          match.user1Id.toString() === currentUser._id.toString() 
            ? match.user2Id 
            : match.user1Id;
        
        const otherUser = await User.findById(otherUserId);
        
        return {
          match: {
            id: match._id,
            createdAt: match.createdAt
          },
          user: otherUser ? {
            id: otherUser._id,
            username: otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            tagline: otherUser.tagline,
            languages: otherUser.languages,
            location: otherUser.location
          } : null
        };
      })
    );
    
    // Filter out any null users (should not happen, but just in case)
    const validMatches = matchesWithUserInfo.filter(m => m.user !== null);
    
    return NextResponse.json({ matches: validMatches });
    
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' }, 
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Swipe from "@/models/Swipe";
import Match from "@/models/Match";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get current session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const { targetId, liked } = await req.json();

    if (!targetId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Record the swipe
    const swipe = new Swipe({
      userId: currentUser._id,
      targetId,
      liked,
    });

    await swipe.save();

    let matchCreated = false;
    let matchId = null;

    // Check for mutual like if this is a like
    if (liked) {
      // Check if target user has already liked current user
      const mutualLike = await Swipe.findOne({
        userId: targetId,
        targetId: currentUser._id,
        liked: true,
      });

      if (mutualLike) {
        // Create a match
        const match = new Match({
          user1Id: currentUser._id,
          user2Id: targetId,
        });

        await match.save();
        matchCreated = true;
        matchId = match._id;
      }
    }

    return NextResponse.json({
      success: true,
      matchCreated,
      matchId,
    });
  } catch (error) {
    console.error("Error recording swipe:", error);
    return NextResponse.json(
      { error: "Failed to record swipe" },
      { status: 500 }
    );
  }
}

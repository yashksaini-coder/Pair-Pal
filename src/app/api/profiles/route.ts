import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Swipe from "@/models/Swipe";
import { findPotentialMatches } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    ``;
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

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get already swiped profiles
    const swipes = await Swipe.find({ userId: currentUser._id });
    const swipedUserIds = swipes.map((swipe) => swipe.targetId);

    // Find potential matches
    const potentialMatches = await findPotentialMatches(
      currentUser._id,
      10, // Limit to 10 profiles at a time
      swipedUserIds
    );

    return NextResponse.json({ profiles: potentialMatches });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

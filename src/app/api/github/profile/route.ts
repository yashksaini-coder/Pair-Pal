import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { fetchGitHubUserData } from "@/lib/github";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Session user:", session);
    

    // Check if we need to sync GitHub data
    const user = await User.findOne({ email: session.user.email });
    console.log("User found:", user);
    
    const lastSync = user?.lastSync ? new Date(user.lastSync) : new Date(0);
    const now = new Date();
    const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    // Auto-sync if data is older than 6 hours and we have an access token
    if (hoursSinceLastSync >= 6 && session.accessToken) {
      try {
        const githubData = await fetchGitHubUserData(session.accessToken);
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            ...githubData,
            lastSync: new Date(),
          },
          { new: true }
        );
        return NextResponse.json({ user: updatedUser });
      } catch (error) {
        console.error("Error auto-syncing GitHub data:", error);
        // Fall back to returning existing user data
        return NextResponse.json({ user });
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { tagline } = await req.json();

    // Lookup order: githubId -> username -> email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { fetchGitHubUserData } from "@/lib/github";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession();

    if (!session || !session.user || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch latest GitHub data
    const githubData = await fetchGitHubUserData(session.accessToken);
    console.log("Fetched GitHub data:", githubData);

    // Update user in database with new GitHub data
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...githubData,
        lastSync: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Error syncing GitHub data:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync GitHub data",
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
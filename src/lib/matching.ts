import User from "@/models/User";
import { IUser } from "@/models/User";
import { Types } from "mongoose";

// Calculate match score between two users
export function calculateMatchScore(currentUser: IUser, potentialMatch: IUser): number {
  let score = 0;
  
  // Languages (40% weight)
  const sharedLanguages = currentUser.languages.filter(lang => 
    potentialMatch.languages.includes(lang)
  );
  score += Math.min(sharedLanguages.length * 10, 40);
  
  // Activity Level (20% weight)
  if (currentUser.activityLevel === potentialMatch.activityLevel) {
    score += 20;
  } else if (
    (currentUser.activityLevel === 'high' && potentialMatch.activityLevel === 'medium') ||
    (currentUser.activityLevel === 'medium' && potentialMatch.activityLevel === 'high') ||
    (currentUser.activityLevel === 'medium' && potentialMatch.activityLevel === 'low') ||
    (currentUser.activityLevel === 'low' && potentialMatch.activityLevel === 'medium')
  ) {
    score += 10; // Partial match for adjacent activity levels
  }
  
  // Interests (20% weight)
  const sharedInterests = currentUser.interests.filter(interest => 
    potentialMatch.interests.includes(interest)
  );
  score += Math.min(sharedInterests.length * 5, 20);
  
  // Location (20% weight)
  if (
    currentUser.location && 
    potentialMatch.location && 
    (currentUser.location.toLowerCase() === potentialMatch.location.toLowerCase() ||
     (currentUser.location.toLowerCase().includes('remote') && 
      potentialMatch.location.toLowerCase().includes('remote')))
  ) {
    score += 20;
  } else if (
    currentUser.location && 
    potentialMatch.location &&
    (currentUser.location.split(',')[1]?.trim().toLowerCase() === 
     potentialMatch.location.split(',')[1]?.trim().toLowerCase())
  ) {
    // Same country but different city
    score += 10;
  }
  
  return score;
}

// Find potential matches for a user
export async function findPotentialMatches(
  userId: string | Types.ObjectId, 
  limit: number = 10,
  alreadySwiped: Types.ObjectId[] = []
) {
  try {
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) throw new Error("User not found");
    
    // Find users who haven't been swiped on yet
    const potentialMatches = await User.find({
      _id: { 
        $ne: userId,
        $nin: alreadySwiped
      }
    }).limit(limit * 3); // Get more than needed for scoring
    
    // Calculate scores and sort
    const scoredMatches = potentialMatches.map(user => {
      const score = calculateMatchScore(currentUser, user);
      return { user, score };
    });
    
    // Sort by score (descending) and take the top ones
    scoredMatches.sort((a, b) => b.score - a.score);
    
    return scoredMatches.slice(0, limit).map(match => ({
      ...match.user.toObject(),
      score: match.score
    }));
    
  } catch (error) {
    console.error("Error finding potential matches:", error);
    throw error;
  }
}
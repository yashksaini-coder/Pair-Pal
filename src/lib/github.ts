import { Octokit } from "@octokit/core";

interface Repository {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  forks_count: number;
  watchers_count: number;
  private: boolean;
  updated_at: string;
  created_at: string;
}

interface Organization {
  login: string;
  avatar_url: string;
  description: string | null;
  url: string;
}

// Function to determine activity level based on contributions
export function getActivityLevel(contributions: number): 'high' | 'medium' | 'low' {
  if (contributions >= 500) return 'high';
  if (contributions >= 100) return 'medium';
  return 'low';
}

// Function to fetch user data from GitHub
export async function fetchGitHubUserData(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });
  
  try {
    // Get basic user info
    const { data: userData } = await octokit.request('GET /user');
    console.log('User Data:', userData);

    // Get user's repos (fix: only use one of type or affiliation)
    let repos: Repository[] = [];
    try {
      const { data } = await octokit.request('GET /user/repos', {
        sort: 'updated',
        per_page: 10,
        type: 'owner', // Only use one of type or affiliation
      });
      repos = data as Repository[];
      console.log('Repos:', repos);
    } catch (repoErr) {
      console.error('Error fetching repos:', repoErr);
    }

    // Get user's events for activity tracking
    let events: any[] = [];
    try {
      const { data } = await octokit.request('GET /users/{username}/events', {
        username: userData.login,
        per_page: 100,
      });
      events = data;
      console.log('Events:', events);
    } catch (eventErr) {
      console.error('Error fetching events:', eventErr);
    }

    // Extract languages from repositories
    const languages = new Set<string>();
    const repoData = await Promise.all(
      (repos as Repository[]).map(async (repo: Repository) => {
        if (repo.language) {
          languages.add(repo.language);
        }
        // Get detailed language breakdown for each repo
        try {
          const { data: repoLangs } = await octokit.request('GET /repos/{owner}/{repo}/languages', {
            owner: userData.login,
            repo: repo.name,
          });
          console.log(`Languages for ${repo.name}:`, repoLangs);
          Object.keys(repoLangs).forEach(lang => languages.add(lang));
        } catch (langErr) {
          console.error(`Error fetching languages for ${repo.name}:`, langErr);
        }
        // Get repository topics
        let topics: { names: string[] } = { names: [] };
        try {
          const { data: topicsData } = await octokit.request('GET /repos/{owner}/{repo}/topics', {
            owner: userData.login,
            repo: repo.name,
            mediaType: {
              previews: ['mercy'], // Required for topics API
            },
          });
          topics = topicsData;
          console.log(`Topics for ${repo.name}:`, topics);
        } catch (topicErr) {
          console.error(`Error fetching topics for ${repo.name}:`, topicErr);
        }
        return {
          name: repo.name,
          url: repo.html_url,
          description: repo.description || '',
          stars: repo.stargazers_count,
          language: repo.language || '',
          topics: topics.names || [],
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          isPrivate: repo.private,
          updatedAt: repo.updated_at,
          createdAt: repo.created_at,
        };
      })
    );

    // Get user's organizations
    let orgs: Organization[] = [];
    try {
      const { data } = await octokit.request('GET /user/orgs');
      orgs = data as Organization[];
      console.log('Organizations:', orgs);
    } catch (orgErr) {
      console.error('Error fetching organizations:', orgErr);
    }

    // Estimate contributions count from events
    const contributionsCount = events.length;

    // Get user's followers and following
    const [followers, following] = await Promise.all([
      octokit.request('GET /user/followers'),
      octokit.request('GET /user/following'),
    ]);
    console.log('Followers:', followers.data);
    console.log('Following:', following.data);

    // Extract interests from repo topics and descriptions
    const interests = new Set<string>();
    repoData.forEach(repo => {
      (repo.topics as string[]).forEach((topic: string) => interests.add(topic));
    });

    const enrichedProfile = {
      githubId: userData.id.toString(),
      username: userData.login,
      name: userData.name,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || '',
      location: userData.location || '',
      company: userData.company || '',
      blog: userData.blog || '',
      twitterUsername: userData.twitter_username || '',
      publicRepos: userData.public_repos,
      publicGists: userData.public_gists,
      privateRepos: (userData as any).private_repos ?? (userData as any).total_private_repos ?? 0,
      totalPrivateRepos: (userData as any).total_private_repos ?? 0,
      ownedPrivateRepos: (userData as any).owned_private_repos ?? 0,
      followers: userData.followers,
      following: userData.following,
      collaborators: (userData as any).collaborators ?? 0,
      diskUsage: (userData as any).disk_usage ?? 0,
      twoFactorAuthentication: (userData as any).two_factor_authentication ?? false,
      plan: (userData as any).plan ?? {},
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      languages: Array.from(languages),
      repos: repoData,
      organizations: (orgs as Organization[]).map(org => ({
        login: org.login,
        avatarUrl: org.avatar_url,
        description: org.description || '',
        url: org.url,
      })),
      activityLevel: getActivityLevel(contributionsCount),
      interests: Array.from(interests),
      hireable: userData.hireable || false,
      email: userData.email || '',
      type: userData.type,
      siteAdmin: userData.site_admin ?? false,
      suspended: (userData as any).suspended ?? false,
      url: userData.url,
      htmlUrl: userData.html_url,
      followersUrl: userData.followers_url,
      followingUrl: userData.following_url,
      gistsUrl: userData.gists_url,
      starredUrl: userData.starred_url,
      subscriptionsUrl: userData.subscriptions_url,
      organizationsUrl: userData.organizations_url,
      reposUrl: userData.repos_url,
      eventsUrl: userData.events_url,
      receivedEventsUrl: userData.received_events_url,
    };

    console.log('Enriched Profile:', enrichedProfile);
    return enrichedProfile;
    
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    const errMsg = (typeof error === 'object' && error && 'message' in error) ? (error as any).message : 'Failed to fetch GitHub data from GitHub API.';
    throw new Error(errMsg);
  }
}
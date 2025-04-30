import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/db";
import { fetchGitHubUserData } from "@/lib/github";
import User from "@/models/User";

const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email repo read:org',
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      if (account) {
        token.accessToken = account.access_token || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
    
      session.accessToken = token.accessToken as string;
    
      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        await connectToDatabase();
        
        // Fetch GitHub data during sign in
        const githubData = await fetchGitHubUserData(account?.access_token as string);
        
        const existingUser = await User.findOne({ githubId: user.id });

        if (!existingUser) {
          // Create new user with GitHub data
          await User.create({
            ...githubData,
            email: user.email,
            lastSync: new Date(),
          });
        } else {
          // Update existing user with latest GitHub data
          await User.findOneAndUpdate(
            { githubId: user.id },
            {
              ...githubData,
              email: user.email,
              lastSync: new Date(),
            }
          );
        }
        
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
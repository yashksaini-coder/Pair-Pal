import mongoose, { Schema, Document } from 'mongoose';

export interface IRepo {
  name: string;
  url: string;
  description?: string;
  stars?: number;
  language?: string;
  topics?: string[];
  forks?: number;
  watchers?: number;
  isPrivate?: boolean;
  updatedAt?: string;
  createdAt?: string;
  size?: number;
  defaultBranch?: string;
  homepage?: string;
  hasIssues?: boolean;
  hasProjects?: boolean;
  hasWiki?: boolean;
  archived?: boolean;
  disabled?: boolean;
  visibility?: string;
  pushedAt?: string;
  sshUrl?: string;
  cloneUrl?: string;
  svnUrl?: string;
}

export interface IOrganization {
  login: string;
  avatarUrl: string;
  description?: string;
  url: string;
  reposUrl?: string;
  eventsUrl?: string;
  membersUrl?: string;
  publicMembersUrl?: string;
  type?: string;
  isVerified?: boolean;
}

export interface IGitHubPlan {
  name?: string;
  space?: number;
  collaborators?: number;
  privateRepos?: number;
}

export interface IUser extends Document {
  // Basic Info
  githubId: string;
  username: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  
  // Profile Info
  bio?: string;
  tagline?: string;
  company?: string;
  blog?: string;
  location?: string;
  hireable?: boolean;
  twitterUsername?: string;
  
  // GitHub Stats
  publicRepos?: number;
  publicGists?: number;
  privateRepos?: number;
  totalPrivateRepos?: number;
  ownedPrivateRepos?: number;
  followers?: number;
  following?: number;
  collaborators?: number;
  diskUsage?: number;
  twoFactorAuthentication?: boolean;
  plan?: IGitHubPlan;
  
  // Content
  languages: string[];
  repos: IRepo[];
  organizations: IOrganization[];
  interests: string[];
  
  // Activity & Status
  activityLevel: 'high' | 'medium' | 'low';
  type?: string;
  siteAdmin?: boolean;
  suspended?: boolean;
  
  // URLs
  url?: string;
  htmlUrl?: string;
  followersUrl?: string;
  followingUrl?: string;
  gistsUrl?: string;
  starredUrl?: string;
  subscriptionsUrl?: string;
  organizationsUrl?: string;
  reposUrl?: string;
  eventsUrl?: string;
  receivedEventsUrl?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
}

const userSchema = new Schema<IUser>(
  {
    // Basic Info
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    avatarUrl: { type: String },
    
    // Profile Info
    bio: { type: String },
    tagline: { type: String },
    company: { type: String },
    blog: { type: String },
    location: { type: String },
    hireable: { type: Boolean },
    twitterUsername: { type: String },
    
    // GitHub Stats
    publicRepos: { type: Number },
    publicGists: { type: Number },
    privateRepos: { type: Number },
    totalPrivateRepos: { type: Number },
    ownedPrivateRepos: { type: Number },
    followers: { type: Number },
    following: { type: Number },
    collaborators: { type: Number },
    diskUsage: { type: Number },
    twoFactorAuthentication: { type: Boolean },
    plan: {
      name: { type: String },
      space: { type: Number },
      collaborators: { type: Number },
      privateRepos: { type: Number }
    },
    
    // Content
    languages: { type: [String], default: [] },
    repos: { 
      type: [{ 
        name: String,
        url: String,
        description: String,
        stars: Number,
        language: String,
        topics: [String],
        forks: Number,
        watchers: Number,
        isPrivate: Boolean,
        updatedAt: String,
        createdAt: String,
        size: Number,
        defaultBranch: String,
        homepage: String,
        hasIssues: Boolean,
        hasProjects: Boolean,
        hasWiki: Boolean,
        archived: Boolean,
        disabled: Boolean,
        visibility: String,
        pushedAt: String,
        sshUrl: String,
        cloneUrl: String,
        svnUrl: String
      }],
      default: []
    },
    organizations: {
      type: [{
        login: String,
        avatarUrl: String,
        description: String,
        url: String,
        reposUrl: String,
        eventsUrl: String,
        membersUrl: String,
        publicMembersUrl: String,
        type: String,
        isVerified: Boolean
      }],
      default: []
    },
    interests: { type: [String], default: [] },
    
    // Activity & Status
    activityLevel: { 
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    type: { type: String },
    siteAdmin: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
    
    // URLs
    url: { type: String },
    htmlUrl: { type: String },
    followersUrl: { type: String },
    followingUrl: { type: String },
    gistsUrl: { type: String },
    starredUrl: { type: String },
    subscriptionsUrl: { type: String },
    organizationsUrl: { type: String },
    reposUrl: { type: String },
    eventsUrl: { type: String },
    receivedEventsUrl: { type: String },
    
    // Timestamps
    lastSync: { type: Date }
  },
  { 
    timestamps: true 
  }
);

// Index for faster queries
userSchema.index({ githubId: 1, username: 1 });
userSchema.index({ languages: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ activityLevel: 1 });
userSchema.index({ location: 1 });

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
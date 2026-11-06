export type Lang = 'en' | 'ar';

export interface LocalizedText {
  en: string;
  ar: string;
}

export type ResourceType = 'drive-folder' | 'drive-file' | 'external';

export type CategoryTag = 'lectures' | 'handouts' | 'cases' | 'media' | 'quizzes';

export interface DriveResource {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  type: ResourceType;
  url: string;
  kindLabel?: string; // e.g. "PDF Pack", "Slides", "Video"
  sizeLabel?: string;
  updatedAt?: string; // ISO date
  tags?: CategoryTag[];
}

export interface BranchNode {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  icon?: string; // key into the icon map
  tags?: CategoryTag[];
  directions?: LocalizedText; // shown at the top of the branch view
  children?: BranchNode[];
  resources?: DriveResource[];
}

export type PostCategory = 'news' | 'directions' | 'update' | 'article';

export interface BlogPost {
  id: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText[]; // paragraphs
  category: PostCategory;
  date: string; // ISO date
  readMinutes?: number;
  pinned?: boolean;
  linkedBranchId?: string;
}

export interface SocialLink {
  id: string;
  label: LocalizedText;
  url: string;
}

export interface SiteProfile {
  name: string;
  subtitle: LocalizedText;
  bio: LocalizedText;
  avatarSrc: string;
  avatarMode: 'pixelate' | 'sprite';
  avatarSpriteSrc?: string;
  statusLabel: LocalizedText;
  socials: SocialLink[];
  pinned: {
    title: LocalizedText;
    body: LocalizedText;
    ctaLabel: LocalizedText;
    branchId: string;
  };
}

export interface InstagramProfile {
  handle: string;
  url: string;
  name: string;
  followers: string;
  following: string;
  verified?: boolean;
  bio: LocalizedText;
}

export interface SiteData {
  profile: SiteProfile;
  branches: BranchNode[];
  posts: BlogPost[];
  instagram?: InstagramProfile;
  /** single-admin gate for the #/admin branch editor (PIN check only) */
  admin?: { pin: string };
}

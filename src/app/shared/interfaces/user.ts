export interface User {
  login: string;
  avatar_url: string;
  url: string;
  html_url: string;
  name: string;
  location: string;
  email?: string | null;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

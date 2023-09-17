import { User } from "./user";
import { UserRepos } from "./user-repos";

export interface UserSearchItem {
  login: string;
  avatar_url: string;
  url: string;
  html_url: string;
  /* campo auxiliares */
  user: User;
  starsQuantity: number;
  reposQuantity: number;
  repos : UserRepos[];
  lastUpdate_at?: string;
}

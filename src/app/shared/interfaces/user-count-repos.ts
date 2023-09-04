import { UserRepos } from "./user-repos";

export interface UserCountRepos{
  username: string;
  quantity: number;
  repos : UserRepos[];
}

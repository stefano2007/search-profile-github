import { UserSearchItem } from "./user-search-item";

export interface UserSearch {
  total_count: number;
  incomplete_results: boolean;
  items: UserSearchItem[];
}

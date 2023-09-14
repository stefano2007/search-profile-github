import Dexie, { Table } from 'dexie';
import { UserSearchItem } from '../interfaces/user-search-item';
import { User } from '../interfaces/user';

export class AppDB extends Dexie {
  tbUserSearchItems!: Table<UserSearchItem, string>;
  tbUsers!: Table<User, string>;

  //https://dexie.org/docs/Tutorial/Angular
  constructor() {
    super('githubDB');
    this.version(3).stores({
      tbUserSearchItems: 'login',
      tbUsers: 'login',
    });
  }
}

export const db = new AppDB();

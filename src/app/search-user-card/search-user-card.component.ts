import { UserRepos } from './../shared/interfaces/user-repos';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../shared/interfaces/user';
import { GithubService } from '../shared/services/github.service';

@Component({
  selector: 'app-search-user-card',
  templateUrl: './search-user-card.component.html',
  styleUrls: ['./search-user-card.component.css']
})
export class SearchUserCardComponent implements OnInit {

  @Input() username :string = '';
  @Output() callbackSetUser = new EventEmitter();
  @Output() callbackSetStars = new EventEmitter();
  @Output() callbackSetRepos = new EventEmitter();

  user : User | undefined;

  countStars : number | null = null;

  constructor(private githubService : GithubService){}

  ngOnInit(): void {
    this.getUserByUserName();
  }

  getUserByUserName(){
    if(this.username.trim().length === 0){
      return;
    }
    this.githubService
        .getUserByUsername(this.username.trim())
        .subscribe((response: User) => {
            this.user = response;
            this.callbackSetUser.emit(this.user);
            this.getStarsByUsername();
            this.githubService.saveUserDB(this.user);
        });
  }

  getStarsByUsername(){
    this.githubService
        .getStarsByUsername(this.username.trim())
        .subscribe({
          next: (stars) =>{
            this.countStars = stars;
            this.callbackSetStars.emit({ username: this.username, quantity: (this.countStars || 0) });

            this.getRepositoriesByUsername();
          },
          error: (error) => console.error(error)
        });
  }

  getRepositoriesByUsername(){
    this.githubService
    .getRepositoriesByUsername(this.username.trim())
    .subscribe((userRepos : UserRepos[]) =>{
      this.callbackSetRepos.emit({username: this.user?.login, quantity: this.user?.public_repos, repos : userRepos});
    });
  }

}

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
            this.getStarsByUsername();
            this.getRepositoriesByUsername();
        });
  }

  getStarsByUsername(){
    this.githubService
        .getStarsByUsername(this.username.trim())
        .subscribe({
          next: (response) =>{
            let headerLink =  response.headers.get('Link');
            //Verfica quando não existir no Header campo Link pode conter zero ou 1 estrela
            if(headerLink != undefined)
              this.countStars = +this.githubService.calcStars(headerLink);
            else
              this.countStars = response.body.length > 0 ? 1 : 0;

            this.callbackSetStars.emit({ username: this.username, quantity: (this.countStars || 0) });
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

import { Component, Input, OnInit } from '@angular/core';
import { User } from '../shared/interfaces/user';
import { GithubService } from '../shared/services/github.service.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-search-user-card',
  templateUrl: './search-user-card.component.html',
  styleUrls: ['./search-user-card.component.css']
})
export class SearchUserCardComponent implements OnInit {

  @Input() username :string = '';

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
            this.getStarsUsername();
        });
  }

  getStarsUsername(){
    this.githubService
        .getStarsByUsername(this.username.trim())
        .pipe(
          tap((response) => {
            let headerLink =  response.headers.get('Link')
            this.countStars = + this.githubService.calcStars(headerLink);
        })
        ).subscribe();
  }
}

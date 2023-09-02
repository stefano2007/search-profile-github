import { Component, Input, OnInit } from '@angular/core';
import { User } from '../shared/interfaces/user';
import { GithubService } from '../shared/services/github.service.service';

@Component({
  selector: 'app-search-user-card',
  templateUrl: './search-user-card.component.html',
  styleUrls: ['./search-user-card.component.css']
})
export class SearchUserCardComponent implements OnInit {

  @Input() username :string = '';

  user : User | undefined;

  constructor(private githubService : GithubService){}

  ngOnInit(): void {
    console.log('OnInit card');
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
            console.log('getUserByUsername', response)
        });
  }
}

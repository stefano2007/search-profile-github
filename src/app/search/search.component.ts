import { UserCountRepos } from '../shared/interfaces/user-count-repos';
import { UserCountStar } from '../shared/interfaces/user-count-star';
import { UserSearch } from './../shared/interfaces/user-search';
import { GithubService } from './../shared/services/github.service.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

constructor(private route : ActivatedRoute,
            private githubService :GithubService){
}

  searchText : string='';
  queryParams : string='';

  per_page: number = 10;
  page: number = 1;

  userSearch : UserSearch = { total_count: 0, incomplete_results: false, items: [] };
  userSearchOriginal? : UserSearch;

  isLoading : boolean = false;

  ngOnInit(): void {
    this.searchText = this.route.snapshot.queryParamMap.get('q') ?? '';

    this.searchSubmit();
  }

  searchSubmit(){
    if(this.searchText.trim().length === 0){
      return;
    }

    this.startLoading();
    this.githubService
        .getUsersBySearchQuery(this.searchText, this.per_page, this.page)
        .subscribe((response: UserSearch) => {
            this.userSearch = response;
            this.closeLoading();
        });
        // TODO: verificar metod caso der erro fechar o loading

  }

  startLoading = () => this.isLoading = true;
  closeLoading() : void {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  setStars(userStar: UserCountStar){
    let index = this.userSearch.items.findIndex(u => u.login == userStar.username);

    if(index >= 0){
      this.userSearch.items[index].starsQuantity = userStar.quantity;
    }
  }

  setRepositories(userRepo: UserCountRepos){
    let index = this.userSearch.items.findIndex(u => u.login == userRepo.username);

    if(index >= 0){
      this.userSearch.items[index].reposQuantity = userRepo.quantity;
      this.userSearch.items[index].repos = userRepo.repos;
    }

    console.log('items', this.userSearch.items)
  }
}

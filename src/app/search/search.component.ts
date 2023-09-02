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
        .getUsersBySearchQuery(this.searchText)
        .subscribe((response: UserSearch) => {
            this.userSearch = response;
            this.closeLoading();
            console.log('response', response)
        });
        // TODO: verificar metod caso der erro fechar o loading

  }

  startLoading = () => this.isLoading = true;
  closeLoading() : void {
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
  }

}

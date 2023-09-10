import { UserCountRepos } from '../shared/interfaces/user-count-repos';
import { UserCountStar } from '../shared/interfaces/user-count-star';
import { UserSearch } from './../shared/interfaces/user-search';
import { GithubService } from '../shared/services/github.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchText : string='';
  pageSize: number = 10;
  page: number = 1;

  userSearch : UserSearch = { total_count: 0, incomplete_results: false, items: [] };
  userSearchOriginal : any = {};

  isLoading : boolean = false;

  selectedSort: any;
  sortOptions: any = [
    { name: "Most followers", options: { sort: "followers", order: "desc" } },
    { name: "Fewest followers", options: { sort: "followers", order: "asc" } },
    { name: "Most recently joined", options: { sort: "joined", order: "desc" } },
    { name: "Least recently joined", options: { sort: "joined", order: "asc" } },
    { name: "Most repositories", options: { sort: "repositories", order: "desc" } },
    { name: "Fewest repositories", options: { sort: "repositories", order: "asc" } }
  ];

  searchReposName : string='';
  starIndexFilter : number = 0;
  constructor(private route : ActivatedRoute, private githubService :GithubService){}

  ngOnInit(): void {
    this.searchText = this.route.snapshot.queryParamMap.get('q') ?? '';

    this.searchSubmit();
  }

  searchSubmit(){
    if(this.searchText.trim().length === 0){
      return;
    }
    this.startLoading();

    this.updateUrl();

    this.clearInput();
    this.githubService
        .getUsersBySearchQuery(this.searchText, this.pageSize, this.page, this.selectedSort)
        .subscribe((response: UserSearch) => {
            this.userSearch = response;
            this.userSearchOriginal = this.userSearch;
            this.closeLoading();
        });
        // TODO: verificar metod caso der erro fechar o loading
  }

  updateUrl(){
    const url = new URL(window.location.href);
    url.searchParams.set('q', this.searchText);
    window.history.pushState({}, '', url);
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
  }

  changePage(page: number){
    this.page = page;
    this.searchSubmit();
  }

  changeSort(){
    this.searchSubmit();
  }

  filterByReposName(){
    this.execFilter();
  }

  execFilter(){
    let inputReposName = this.searchReposName.trim();

    let starsRange = this.getStarsRange(this.starIndexFilter);

    if(inputReposName == '' && starsRange === 0 ){
        this.clearFilter();
        return;
    }

    //obter a lista original
    this.userSearch = {...this.userSearchOriginal};
    let itemsTemp = this.userSearch.items;

    if(inputReposName !== ''){
      itemsTemp = itemsTemp.filter(u => u.repos?.some(repo => repo.name.toUpperCase().includes(inputReposName.toUpperCase())));
    }

    if(starsRange > 0){
      itemsTemp = itemsTemp.filter(u => u.starsQuantity >= starsRange);
    }

    this.userSearch.total_count = itemsTemp.length;
    this.userSearch.items = itemsTemp;
  }

  clearFilter(){
    this.userSearch = {...this.userSearchOriginal};
  }

  changeStarFilter(){
    this.execFilter();
  }

  getStarsRangeText(){
    return `>= ${this.getStarsRange(this.starIndexFilter)}`;
  }

  getStarsRange(num: number): number {
    switch (num) {
      case 1: return 10;
      case 2: return 100;
      case 3: return 500;
      case 4: return 1000;
      case 5: return 10000;
      case 6: return 100000;
      default: return 0;
    }
  }

  clearInput(){
    this.searchReposName = '';
    this.starIndexFilter = 0;
  }
}

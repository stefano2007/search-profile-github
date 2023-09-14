import { OnlineOfflineService } from './../shared/services/online-offline.service';
import { MessageService, MessageType } from './../shared/services/message.service';
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

  constructor(private route : ActivatedRoute,
             private githubService :GithubService,
             private messageService : MessageService,
             private onlineOfflineService :OnlineOfflineService
             )
  {
    this.ouvirStatusConexao();
  }

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

    this.clearInputsSubQuery();
    this.githubService
        .getUsersBySearchQuery(this.searchText, this.pageSize, this.page, this.selectedSort)
        .subscribe({
          next: (response: UserSearch) => {
            this.userSearch = response;
            this.userSearchOriginal = this.userSearch;
            this.userSearch.total_count > 0
              ? this.messageService.showMessage('Sucess',`found ${this.userSearch.total_count} records`)
              : this.messageService.showMessage('Warning','no records found', MessageType.info);
          },
          error: (error) => {
            console.error(error);
            //this.messageService.showMessage('Error','an error has occurred', MessageType.error);
            this.closeLoading();
          },
          complete: () => {this.closeLoading();}
        });
  }

  updateUrl(){
    const url = new URL(window.location.href);
    url.searchParams.set('q', this.searchText);
    window.history.pushState({}, '', url);
  }

  startLoading= () => this.isLoading = true;

  closeLoading= () => this.isLoading = false;

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

  clearInputsSubQuery(){
    this.selectedSort = undefined;
    this.searchReposName = '';
    this.starIndexFilter = 0;
  }

  ouvirStatusConexao(){
    this.onlineOfflineService
      .statusConnect
      .subscribe({
        next: (isOnline) => {
          if(isOnline){
            this.messageService.showMessage('Online','Connection reestablished.', MessageType.info);
          }else{
            this.messageService.showMessage('OffLine','There seems to be a problem with the network connection.', MessageType.warning);
          }
        }
      })
  }

}

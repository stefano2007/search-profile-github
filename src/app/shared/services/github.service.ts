import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, from } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserSearch } from '../interfaces/user-search';
import { UserRepos } from '../interfaces/user-repos';
import { UserSearchItem } from '../interfaces/user-search-item';
import { db } from '../db/db';
import { OnlineOfflineService } from './online-offline.service';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  headersRequest = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Basic ${window.btoa(environment.github_Token)}`
  });

  constructor(
    private httpClient: HttpClient,
    private onlineOfflineService: OnlineOfflineService
    ) { }

  getUsersBySearchQuery(query: string, per_page: number, page: number, params_order_by : any): Observable<UserSearch>{
    if(this.searchOffline()){
      return this.getUsersBySearchQueryDB(query, per_page, page, params_order_by);
    }

    let queryParams = new HttpParams({
      fromObject: {
        q: query,
        per_page: per_page,
        page: page
      }
    });

    if(params_order_by && params_order_by !== undefined ){
      queryParams = queryParams.set('sort', params_order_by.sort);
      queryParams = queryParams.set('order', params_order_by.order);
    }

    return this.getUsersBySearchQueryAPI(queryParams);
  }

  getUserByUsername(username: string): Observable<User>{
    if(this.searchOffline()){
      return this.getUserByUsernameDB(username);
    }

    return this.getUserByUsernameAPI(username);
  }

  getStarsByUsername(username: string): Observable<number> {
    if(this.searchOffline()){
      return this.getStarsByUsernameDB(username);
    }

    return this.getStarsByUsernameAPI(username);
  }

  getRepositoriesByUsername(username: string): Observable<UserRepos[]> {
    if(this.searchOffline()){
      return this.getRepositoriesByUsernameDB(username);
    }

    return this.getRepositoriesByUsernameAPI(username);
  }

  calcStars(headerLink: string) : string{
    let urlLastPage = headerLink?.split(',')[1];
    if(!urlLastPage){
      return '0';
    }
    //TODO: Revisar logica
    urlLastPage = urlLastPage.split(';')[0]?.replace('<','').replace('>','');

    let starsCount = urlLastPage.replace(/.*&page=(.*)/, '$1').trim()
    return starsCount;
  }

  searchOffline(): boolean{
    return !this.onlineOfflineService.isOnline;
  }

  /* init API */
  getUsersBySearchQueryAPI(queryParams: HttpParams): Observable<UserSearch>{
    return this.httpClient
      .get<UserSearch>(`${environment.url_API}/search/users`,{
        params: queryParams,
        headers: this.headersRequest
      })
      .pipe(
        retry(0)
      );
  }

  getUserByUsernameAPI(username: string): Observable<User>{
    return this.httpClient
      .get<User>(`${environment.url_API}/users/${username}`,{
        headers: this.headersRequest
      })
      .pipe(
        retry(0)
      );
  }

  getStarsByUsernameAPI(username: string): Observable<number> {
    //Ao obter 1 registro e existe N retorna um Header chamado Link com a ultima pagina igual a quantidade total de estrelas
    return this.httpClient
    .get<any>(`${environment.url_API}/users/${username}/starred?per_page=1`,{
      observe: 'response',
      headers: this.headersRequest
    })
    .pipe(
      map(response =>{
        let countStars : number = 0;
        let headerLink =  response.headers.get('Link');
        //Verfica quando não existir no Header campo Link pode conter zero ou 1 estrela
        if(headerLink != undefined)
          countStars = +this.calcStars(headerLink);
        else
          countStars = response.body.length > 0 ? 1 : 0;

        return countStars;
      }),
      retry(0)
    );
  }

  getRepositoriesByUsernameAPI(username: string): Observable<UserRepos[]> {
    return this.httpClient
    .get<UserRepos[]>(`${environment.url_API}/users/${username}/repos`,{
      headers: this.headersRequest
    })
    .pipe(
      retry(0)
    );
  }

  /* init db */
  async saveUserDB(user : User){
    if(this.searchOffline()) return;

    let userCreate = {... user, lastUpdate_at: new Date().toISOString()};
    await db.tbUsers.put(userCreate);
  }

  async saveUserSearchItemDB(userSearchItem : UserSearchItem){
    if(this.searchOffline()) return;

    let userSearchItemCreate = {... userSearchItem, lastUpdate_at: new Date().toISOString()}
    await db.tbUserSearchItems.put(userSearchItemCreate);
  }

  getUsersBySearchQueryDB(query: string, per_page: number, page: number, params_order_by : any): Observable<UserSearch>{
    query = query?.toLowerCase();

    return from(
        db.tbUserSearchItems
        .filter(u => {
          return u.login?.toLowerCase().startsWith(query) || u.user?.name?.toLowerCase()?.includes(query);
        })
        //.offset((page -1) * per_page)
        //.limit(per_page)
        .toArray()
        .then<UserSearch>(result => {
          if(params_order_by && params_order_by !== undefined )
            result = this.orderUserSearchItem(result, params_order_by);

            let resultPage = result
                              .slice((page - 1) * per_page, page * per_page);

            return { total_count: result.length, incomplete_results: false, items: resultPage }
        })
      );
  }

  orderUserSearchItem(result : UserSearchItem[],  params_order_by : any){

    if(params_order_by.sort == 'followers'){
      result = result.sort((a, b) => {
                        return params_order_by.order == 'asc'
                          ? a.user?.followers - b.user?.followers
                          : b.user?.followers - a.user?.followers
                        });
    } else if(params_order_by.sort == 'joined'){
      result = result.sort((a, b) => {
                        if (a.user?.created_at > b.user?.created_at) {
                            return params_order_by.order == 'asc' ? 1 : -1;
                        }
                        if (b.user?.created_at > a.user?.created_at) {
                            return params_order_by.order == 'asc' ? -1 : 1;
                        }
                        return 0;
                      });
    } else if(params_order_by.sort == 'repositories'){
      result = result.sort((a, b) =>{
                        return params_order_by.order == 'asc'
                          ? a.user?.public_repos - b.user?.public_repos
                          : b.user?.public_repos - a.user?.public_repos
                      });
    }
    return result;
  }

  getUserByUsernameDB(username: string): Observable<User | any>{
    return from(
      db.tbUsers
      .where("login").equals(username)
      .first()
    );
  }

  getStarsByUsernameDB(username: string): Observable<number> {
    return from(
      db.tbUserSearchItems
      .where("login").equals(username)
      .first()
      .then(user => {
        return user?.starsQuantity ?? 0;
      })
    );
  }

  getRepositoriesByUsernameDB(username: string): Observable<UserRepos[]> {
    return from(
      db.tbUserSearchItems
      .where("login").equals(username)
      .first()
      .then(user => {
        return user?.repos ?? [];
      })
    );
  }
}

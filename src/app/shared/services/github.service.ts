import { OnlineOfflineService } from './online-offline.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserSearch } from '../interfaces/user-search';
import { UserRepos } from '../interfaces/user-repos';
import { UserSearchItem } from '../interfaces/user-search-item';
import { db } from '../db/db';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  headersRequest = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Basic ${environment.github_Token}`
  });

  constructor(
    private httpClient: HttpClient,
    private onlineOfflineService: OnlineOfflineService
    ) { }

  getUsersBySearchQuery(query: string, per_page: number, page: number, params_order_by : any): Observable<UserSearch>{
    if(!this.onlineOfflineService.isOnline){
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

  getUsersBySearchQueryAPI(queryParams: HttpParams): Observable<UserSearch>{
    return this.httpClient
      .get<UserSearch>(`${environment.url_API}/search/users`,{
        params: queryParams,
        headers: this.headersRequest
      })
      .pipe(
        retry(0),
        catchError(this.handleError)
      );
  }

  getUsersBySearchQueryDB(query: string, per_page: number, page: number, params_order_by : any): Observable<UserSearch>{
    //TODO: Adicionar ordenação com parametro params_order_by
    //TODO: Filtrar por nome, para isso precisa obter o nome do endpoint de detalhes do usuario
    return from(
        db.tbUserSearchItems
        .where("login").startsWith(query)
        .offset((page -1) * per_page)
        .limit(per_page)
        .toArray()
        .then<UserSearch>(result => {
          return { total_count: result.length, incomplete_results: false, items: result }
        })
      );
  }

  getUserByUsername(username: string): Observable<User>{
    if(!this.onlineOfflineService.isOnline){
      return this.getUserByUsernameDB(username);
    }

    return this.getUserByUsernameAPI(username);
  }

  getUserByUsernameAPI(username: string): Observable<User>{
    return this.httpClient
      .get<User>(`${environment.url_API}/users/${username}`,{
        headers: this.headersRequest
      })
      .pipe(
        retry(0),
        catchError(this.handleError)
      );
  }

  getUserByUsernameDB(username: string): Observable<User | any>{
    return from(
      db.tbUsers
      .where("login").equals(username)
      .first()
    );
  }

  getStarsByUsername(username: string): Observable<number> {
    if(!this.onlineOfflineService.isOnline){
      return this.getStarsByUsernameDB(username);
    }

    return this.getStarsByUsernameAPI(username);
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
      retry(0),
      catchError(this.handleError)
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

  getRepositoriesByUsername(username: string): Observable<UserRepos[]> {
    if(!this.onlineOfflineService.isOnline){
      return this.getRepositoriesByUsernameDB(username);
    }

    return this.getRepositoriesByUsernameAPI(username);
  }

  getRepositoriesByUsernameAPI(username: string): Observable<UserRepos[]> {
    return this.httpClient
    .get<UserRepos[]>(`${environment.url_API}/users/${username}/repos`,{
      headers: this.headersRequest
    })
    .pipe(
      retry(0),
      catchError(this.handleError)
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

  // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if(error.status == '0'){
        alert(`There seems to be a problem with the network connection. \nDetails: ${error.message}`);
      }
    }
    return throwError(() => {
      return errorMessage;
    });
  }

  async saveUserDB(user : User){
    if(!this.onlineOfflineService.isOnline) return;

    let userCreate = {... user, lastUpdate_at: new Date().toISOString()};
    await db.tbUsers.put(userCreate);
  }

  async saveUserSearchItemDB(userSearchItem : UserSearchItem){
    if(!this.onlineOfflineService.isOnline) return;

    let userSearchItemCreate = {... userSearchItem, lastUpdate_at: new Date().toISOString()}
    await db.tbUserSearchItems.put(userSearchItemCreate);
  }
}

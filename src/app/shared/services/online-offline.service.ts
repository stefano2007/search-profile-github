import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineOfflineService {
  private statusConnect$ = new Subject<boolean>();

  //adicionar evento para monitorar quando Online ou Offline.
  constructor() {
    window.addEventListener('online', () => this.updateConnect());
    window.addEventListener('offline', () => this.updateConnect());
  }

  get isOnline(): boolean{
    return !!window.navigator.onLine;
  }

  //enviar uma nova mensagem no Subject para quem estiver escutando
  updateConnect(){
    this.statusConnect$.next(this.isOnline);
  }

  //expoe evento de atualização do status através de um Observable
  get statusConnect() : Observable<boolean>{
    return this.statusConnect$.asObservable();
  }
}

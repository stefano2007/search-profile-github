import { OnlineOfflineService } from './../shared/services/online-offline.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  theme: Theme = Theme.Light;
  isOnline : boolean = true;

  constructor(private onlineOfflineService:OnlineOfflineService){}

  ngOnInit(){
    this.checkTheme();
    this.updateIsOnline();
    this.ouvirStatusConexao();
  }

  updateIsOnline(){
    this.isOnline = this.onlineOfflineService.isOnline;
  }

  lsThema : string = 'thema';
  checkTheme(){
    let themeLocalStorage = localStorage.getItem(this.lsThema);
    if(!!themeLocalStorage){
      this.setTheme(themeLocalStorage as Theme);
    }
  }

  updateTheme(){
    let newTheme = this.theme == Theme.Light ? Theme.Dark : Theme.Light;

    this.setTheme(newTheme);
  }

  setTheme(theme: Theme){
    this.theme = theme;
    localStorage.setItem(this.lsThema, this.theme.toString());
    document
        .querySelector('html')
        ?.setAttribute('data-bs-theme', this.theme.toString());
  }

  ouvirStatusConexao(){
    this.onlineOfflineService
      .statusConnect
      .subscribe({
        next: (isOnline) => {
          this.updateIsOnline();
        }
      });
  }
}

enum Theme{
  Dark = 'dark',
  Light = 'light'
}

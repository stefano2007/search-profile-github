import { OnlineOfflineService } from './../shared/services/online-offline.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  theme: Theme = Theme.Light;

  constructor(private onlineOfflineService:OnlineOfflineService){}

  ngOnInit(){
    this.checkTheme();
  }

  checkTheme(){
    let themeLocalStorage = localStorage.getItem('theme');

    if(!themeLocalStorage){
      this.setTheme(Theme.Light);
    }
  }

  updateTheme(){
    let newTheme = this.theme == Theme.Light ? Theme.Dark : Theme.Light;

    this.setTheme(newTheme);
  }

  setTheme(theme: Theme){
    this.theme = theme;
    localStorage.setItem('data-bs-theme', this.theme.toString());
    document.querySelector('html')?.setAttribute('data-bs-theme', this.theme.toString());
  }


}

enum Theme{
  Dark = 'dark',
  Light = 'light'
}

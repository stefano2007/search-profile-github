import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchText = '';
  constructor(private router: Router){}

  ngOnInit(): void {
  }

  searchSubmit(){
    if(this.searchText.trim().length == 0)
      return;

    //redirecionar a mensagem para proxima tela
    this.router.navigate(['/search'], { queryParams: { q: this.searchText.trim() } });
  }

}

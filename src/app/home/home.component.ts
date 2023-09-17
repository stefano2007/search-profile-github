import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, MessageType } from '../shared/services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchText = '';
  constructor(private router: Router,
    private messageService: MessageService
    ){}

  ngOnInit(): void {
  }

  searchSubmit(){
    if(this.searchText.trim().length == 0){
      this.messageService.showMessage('Warning','Field search is requerid', MessageType.warning)
      return;
    }

    //redirecionar a mensagem para proxima tela
    this.router.navigate(['/search'], { queryParams: { q: this.searchText.trim() } });
  }

}

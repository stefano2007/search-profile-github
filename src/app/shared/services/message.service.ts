import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

constructor(private toastr : ToastrService) { }

  showMessage(title: string, msg: string, type : MessageType = MessageType.success) {
    switch(type){
      case MessageType.error:
        this.toastr.error(msg, title);
        break;
      case MessageType.info:
        this.toastr.info(msg, title);
        break;
      case MessageType.success:
        this.toastr.success(msg, title);
        break;
      case MessageType.warning:
        this.toastr.warning(msg, title);
        break;
      default:
        this.toastr.success(msg, title);
        break;
    }
  }
}

export enum MessageType{
  error,
  info,
  success,
  warning,
}

/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { MessageService } from './message.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('Service: Message', () => {

  let toastrService: ToastrService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      declarations: [],
      providers: [{ provide: ToastrService, useValue: toastrService }],
    }).compileComponents();
    //toastrService = TestBed.inject(ToastrService);
  });

  it('should ...', inject([MessageService], (service: MessageService) => {
    expect(service).toBeTruthy();
  }));
});

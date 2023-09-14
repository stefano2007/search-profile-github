/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OnlineOfflineService } from './online-offline.service';

describe('Service: OnlineOffline', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OnlineOfflineService]
    });
  });

  it('should ...', inject([OnlineOfflineService], (service: OnlineOfflineService) => {
    expect(service).toBeTruthy();
  }));
});

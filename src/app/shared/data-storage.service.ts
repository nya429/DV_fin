import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators';

import { Participant } from './participant.model';

@Injectable()
export class DataStorageService {
    constructor(private httpClient: HttpClient,
                // private pmService: ParticipantManagementService
              ) {}

    getConfig() {

    }

    getParticipants() {
        this.httpClient.get<Participant[]>('http://localhost:3000/participant/list', {
          observe: 'body',
          responseType: 'json'
        })
        .subscribe(
            (participants: Participant[]) => {
              // this.pmService.setParticipants(participants);
              // console.log(participants);
              return(participants);
            }, (err: HttpErrorResponse)  => {
              console.error(err);
            }
        );
  }
}

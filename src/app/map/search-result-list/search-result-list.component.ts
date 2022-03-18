// import { ParticipantService } from './../../participant-management/participant.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, OnInit } from '@angular/core';

import { Participant } from './../../shared/participant.model';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-search-result-list',
  templateUrl: './search-result-list.component.html',
  styleUrls: ['./search-result-list.component.css']
})
export class SearchResultListComponent implements OnInit, OnDestroy {
   pSubscription: Subscription;
   participants: Participant[];
   selectedParticipants: Participant[];

  constructor(
    // private pmService: ParticipantService
    ) { }

  ngOnInit() {
    this.selectedParticipants = [];
    // this.pSubscription = this.pmService.participantsChanged.subscribe(
    //   (participants: Participant[]) => {
    //     this.participants = participants;
    //   });
  }

  ngOnDestroy() {
    // this.pSubscription.unsubscribe();
  }

  onClose(e: Event) {
    e.stopPropagation();
  }

  onParticipantCheck(e, index: number) {
    if (e.target.checked) {
      this.selectedParticipants.push(this.participants[index]);
    } else {
      const i = this.selectedParticipants.indexOf(this.participants[index]);
      this.selectedParticipants.splice(i, 1);
    }
  }

}

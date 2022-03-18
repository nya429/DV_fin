import { Participant } from './../../shared/participant.model';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MapService } from './../map.service';

import { Tracker } from './../../shared/tracker.model';
// import { listItemSlideStateTrigger } from '../../participant-management/participant-list.animation';
import { listItemFadeSlideStateTrigger } from '../map.animation';

@Component({
  selector: 'app-tracker-list',
  templateUrl: './tracker-list.component.html',
  styleUrls: ['./tracker-list.component.css'],
  // animations: [ listItemSlideStateTrigger, listItemFadeSlideStateTrigger ]
})
export class TrackerListComponent implements OnInit, OnDestroy {
  trackers: Tracker[];
  trackersChangeSub: Subscription;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.trackers = this.mapService.getTrackers();
    this.trackersChangeSub = this.mapService.trackerListChanges.subscribe(() => {
      this.trackers = this.mapService.getTrackers();
    });
  }

  ngOnDestroy() {
    this.trackersChangeSub.unsubscribe();
  }

  getLastActiveTrackers() {
    this.mapService.getLastActiveTrackers();
  }
}

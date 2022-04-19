import { Participant } from './../../shared/participant.model';
import { Tracker } from './../../shared/tracker.model';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { MapService } from './../map.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-tracker-detail',
  templateUrl: './tracker-detail.component.html',
  styleUrls: ['./tracker-detail.component.css']
})
export class TrackerDetailComponent implements OnInit, OnDestroy {
  @ViewChild('f') trackerForm: NgForm;
  editMode = false;
  editedTrackerIndex: number;
  tracker: Tracker;
  tagId: string;
  fullName: string;
  time = null;
  timeTotal = 0;
  timeCurrent = 0;
  status: number;
  note: string;
  participant: Participant;
  locX: number;
  locY: number;
  productId: number;
  mostVisit: number[] = [];

  private selectedTrackerSubscription: Subscription;
  private hasSelectedTrackerSubscription: Subscription;
  private trackerLocChangeSubscription: Subscription;
  private trackerListChangeSubscription: Subscription;
  private mapStopSub: Subscription;
  constructor(private mapService: MapService) { }

  ngOnInit() {

    if (this.mapService.selectedTrackerId !== null) {
      console.log(this.mapService.selectedTrackerId)
      this.setTrackerDetail(this.mapService.selectedTrackerId + 1);
    }
    // TODO get initial selected data
    // this.tracker = this.mapService
    this.selectedTrackerSubscription = this.mapService.selectedTrackerIndex.subscribe(
      (index: number) => {
        this.editMode = false;
        this.setTrackerDetail(index);
      }
    );
    this.hasSelectedTrackerSubscription = this.mapService.hasSelectedTracker.subscribe(
      (index: number) => {
        this.editMode = false;
        this.setTrackerDetail(index);
      });
    this.trackerListChangeSubscription = this.mapService.trackerListChanges.subscribe(() => {
      this.setTrackerDetail(null);
    });
    this.trackerLocChangeSubscription = this.mapService.trackerLocChanges.subscribe(({trackers, dur}) => {
        // const data = trackers
        this.time = this.editedTrackerIndex ? this.mapService.getTrackerTime(this.editedTrackerIndex) : null;
        this.fullName =  this.editedTrackerIndex ? this.mapService.getTrackerAlias(this.editedTrackerIndex) : null;
        // this.timeCurrent = this.tracker && this.tracker.locs && this.tracker.locs.length > 0 ?
        // this.tracker.locs[this.tracker.currentLoc].time - this.tracker.locs[0].time : 0;
        this.productId = this.editedTrackerIndex ? this.mapService.getTrackerProductId(this.editedTrackerIndex)  : null;
        [this.locX, this.locY] = this.editedTrackerIndex ? this.mapService.getTrackerCurLoc(this.editedTrackerIndex) : [ null, null];
        this.mostVisit = this.editedTrackerIndex ? this.mapService.getTrackerMostVisit(this.editedTrackerIndex) : null;
    });
    this.mapStopSub = this.mapService.onStopped.subscribe(() => {
      this.time = null;
    });
  }

  ngOnDestroy() {
    this.trackerListChangeSubscription.unsubscribe();
    this.trackerLocChangeSubscription.unsubscribe();
    this.selectedTrackerSubscription.unsubscribe();
    this.hasSelectedTrackerSubscription.unsubscribe();
    this.mapStopSub.unsubscribe();
  }

  onEdit() {
    this.editMode = true;

    console.log(this.trackerForm);
  }

  onUpdate(form: NgForm) {
    console.log('onupdate in detail');
    const value = form.value;
    this.mapService.updateTrackerInfo(this.editedTrackerIndex, value);
    // this.alia = value.alias;
    this.editMode = false;
  }

  onCancle() {
    this.editMode = false;
  }

  setTrackerDetail(index: number) {
    console.log('setTrackerDetail', index)
    if  (index == null) {
      this.editedTrackerIndex = null;
      this.tracker = null;
      this.tagId = null;
      this.fullName = null;
      this.note = null;
      this.time = null;
      this.timeTotal = 0;
      this.timeCurrent = 0;
      this.productId = null;
      this.locX = null;
      this.locY = null;
      this.mostVisit = [];
      return;
    } else {
      this.editedTrackerIndex = index - 1;
      this.tracker = this.mapService.getTracker(this.editedTrackerIndex);
      this.tagId = this.tracker.tagId;
      this.participant = this.tracker.participant ? this.tracker.participant : null;
      this.fullName = this.tracker.participant ? `${this.participant.firstName} ${this.participant.lastName}` : this.tracker.alias;
      this.note = this.tracker.note ? this.tracker.note : 'N/A';
      this.time = this.tracker.time ? this.tracker.time : null;
      this.timeTotal = this.tracker.locs && this.tracker.locs.length > 0 ?
       this.tracker.locs[this.tracker.locs.length - 1].time - this.tracker.locs[0].time : 0;
      this.timeCurrent = this.tracker.locs && this.tracker.locs.length > 0 ?
       this.tracker.locs[this.tracker.currentLoc].time - this.tracker.locs[0].time : 0;
      this.productId = this.tracker.productId;
      this.locX = Math.floor(this.tracker.xCrd);
      this.locY = Math.floor(this.tracker.yCrd);
      const max = this.tracker.accVisit.reduce((acc, curr) => curr > acc ? curr : acc);
      const mostVisit = this.tracker.accVisit.reduce((acc: number[], curr, idx) => curr === max ? [...acc, idx] : acc, []);
      this.mostVisit = mostVisit;
    }
  }

  toHHMMSS  (sec_num: number) {
    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);
    const hourStr = hours < 10 ? '0' + hours : '' + hours;
    const minuteStr = minutes < 10 ? '0' + minutes : '' + minutes;
    const secondStr = seconds < 10 ? '0' + seconds : '' + seconds;

    return `${hourStr}:${minuteStr}:${secondStr}`;
  }

  mostVisitStr() {
    if (!this.mostVisit || this.mostVisit === null || this.mostVisit.length === 0) {
      return;
    }

    return this.mostVisit.map(i => `Zone_${i + 1}  `);
  }
}

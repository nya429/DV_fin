import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

// import { ParticipantService } from './../../participant-management/participant.service';
import { MapService } from '../map.service';
import { hiddenItemStateTrigger, companyFilterSlideStateTrigger } from './../map.animation';


@Component({
  selector: 'app-map-control-penal',
  templateUrl: './map-control-penal.component.html',
  styleUrls: ['./map-control-penal.component.css'],
  animations: [ hiddenItemStateTrigger, companyFilterSlideStateTrigger ]
})
export class MapControlPenalComponent implements OnInit, OnDestroy {
  private onStartSubscription: Subscription;
  private onStopSubscription: Subscription;
  private onInitiatedSubscription: Subscription;
  private onStoppingSubscription: Subscription;
  private onCompanySelectedSubscription: Subscription;
  private dropdownSubscription: Subscription;
  private sliderSubscription: Subscription;
  // @ViewChild('penal') private penal: ElementRef;
  @ViewChild('f') filterForm: NgForm;
  @ViewChild('ranger') slider: ElementRef;
  started: boolean;
  initiated: boolean;
  stopped: boolean;
  stopping: boolean;

  playBackMode = false;

  filterInputFocused = false;
  filterFolded = true;
  dropdownFolded = true;
  priorityStatusFilter: number;
  companyFilter: object;
  companyFilterNull = {
    'company_id': null,
    'company_name': 'All Company'
  };
  priorityFilter = 0;

  constructor(private mapService: MapService,
              private render: Renderer2,
              // private pmService: ParticipantService
              ) { }

  ngOnInit() {
    this.companyFilter = this.companyFilterNull;
    this.setStatus();
    this.onStartSubscription = this.mapService.started.subscribe(started => this.started = started);
    this.onStopSubscription = this.mapService.stopped.subscribe(stopped => this.stopped = stopped);
    this.onInitiatedSubscription = this.mapService.intiated.subscribe(initiated => this.initiated = initiated);
    this.onStoppingSubscription = this.mapService.stopping.subscribe(stopping => this.stopping = stopping);
    // this.onCompanySelectedSubscription = this.pmService.companySelected.subscribe(company => {
    //    this.companyFilter = company;
    //    if (this.filterFolded) {
    //     this.onInputBlur();
    //    } });
    this.dropdownSubscription = this.mapService.dropdownFolded.subscribe(folded => this.dropdownFolded = folded);
    this.sliderSubscription = this.mapService.sliderSubject.subscribe(p => this.playSlider(p));
  }

  ngOnDestroy() {
    this.onStartSubscription.unsubscribe();
    this.onStopSubscription.unsubscribe();
    this.onInitiatedSubscription.unsubscribe();
    this.onStoppingSubscription.unsubscribe();
    // this.onCompanySelectedSubscription.unsubscribe();
    this.dropdownSubscription.unsubscribe();
    this.sliderSubscription.unsubscribe();
  }

  onStart() {
    if (this.stopping) {
      return false;
    }
    if (this.playBackMode) {
      console.log('ControlPanel start() history?', this.started);
      this.mapService.testHistoryLocals();
    } else {
     // dummy move
    //  this.mapService.start();
     // real-time move, table: simulation_2
     console.log('ControlPanel start() realtime?', this.started);
     this.mapService.startSync();
    }
  }

  onStop() {
    if (this.initiated) {
      this.mapService.stop();
    }
  }

  onFilterInputClick() {
    // this.render.setStyle(this.penal.nativeElement, 'height', '115px');
    this.filterFolded = false;
  }

  onFilterFold() {
    //  this.render.setStyle(this.penal.nativeElement, 'height', '90px');
    this.filterFolded = true;
    this.onInputBlur();
  }

  onPrioritySelect() {
    this.priorityFilter = this.filterForm.value.priorityStatus;
  }

  onSerachByTerm() {
    const term = this.filterForm.value.term;
    const companyId = this.companyFilter['company_id'] ? this.companyFilter['company_id'] : 0;
    const priority = this.filterForm.value.priorityStatus ? this.filterForm.value.priorityStatus : 0;
    const filter = {
      'term': term,
      'companyId': companyId,
      'priority': priority
    };
    this.mapService.getParticipantListByFilters(filter);
  }

  onInputFocus() {
    this.filterInputFocused = true;
  }

  onInputBlur() {
    this.filterInputFocused = false;
  }

  onDropdownClick(event) {
    this.mapService.onCompanyDropdownFolded(!this.dropdownFolded);
    this.onInputFocus();
    event.stopPropagation();
  }

  onDropdownRemove(event) {
    this.companyFilter = this.companyFilterNull;
    event.stopPropagation();
  }

  setStatus() {
    this.initiated = this.mapService.mapInitiated;
    this.started = this.mapService.mapStarted;
    this.stopped = this.mapService.mapStopped;
    this.stopping = this.mapService.mapStopping;
  }

  onToggle() {
    if (this.stopped) {
      this.playBackMode = !this.playBackMode;
    }
  }

  onSlide(e) {
    this.mapService.changeSliderP(e);
  }

  getSliderP() {
    return this.mapService.getSlideP();
  }

  playSlider(p) {
    this.slider.nativeElement.value = p;
  }
}

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { MapService } from './map.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'] ,
})
export class MapComponent implements OnInit, OnDestroy {
  dropdownFolded: boolean;
  dropdownSubscription: Subscription;

  private leave: boolean;
  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.dropdownFolded = true;
    this.dropdownSubscription = this.mapService.dropdownFolded.subscribe(folded =>
      this.dropdownFolded = folded);
  }

  ngOnDestroy() {
    this.dropdownSubscription.unsubscribe();
  }

  onCompanyDropdownFold() {
    if (this.dropdownFolded) {
      return;
    }
    this.mapService.onCompanyDropdownFolded(true);
  }

  @HostListener('window:blur')
  onLeave() {
    // if (this.mapService.mapStarted) {
    //   this.leave = true;
    // }
    // this.mapService.stop();
  }

  @HostListener('window:focus')
  onFocus() {
    if (this.leave) {
      // this.mapService.onLeavePage();
      // this.leave = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.mapService.onWindowResize();
  }
}

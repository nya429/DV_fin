import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { MapService } from './../map.service';

@Component({
  selector: 'app-map-tooltip',
  templateUrl: './map-tooltip.component.html',
  styleUrls: ['./map-tooltip.component.css']
})
export class MapTooltipComponent implements OnInit, OnDestroy {
  display: boolean;
  pageBlureSub: Subscription;
  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.display = false;
      this.pageBlureSub = this.mapService.pageBlur.subscribe(
        () => this.display = true
      );
  }

  ngOnDestroy() {
    this.pageBlureSub.unsubscribe();
  }

  onDismiss() {
    this.display = false;
  }
}

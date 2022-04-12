import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy, Input, ViewChild, Renderer2, ElementRef, AfterViewChecked } from '@angular/core';

import { Tracker } from './../../../shared/tracker.model';
import { MapService } from '../../map.service';
import { t } from '@angular/core/src/render3';

@Component({
  selector: 'app-tracker-list-item',
  templateUrl: './tracker-list-item.component.html',
  styleUrls: ['./tracker-list-item.component.css']
})
export class TrackerListItemComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('color') private colorBox: ElementRef;
  @ViewChild('colordot') private colorDot: ElementRef;
  @ViewChild('f') trackerForm: NgForm;
  @Input() tracker: Tracker;
  @Input() index: number;
  private id;
  hidden = false;
  editMode = false;
  isSelected = false;
  selectSubscription: Subscription;
  color: string;
  alias: string;

  constructor(public mapService: MapService,
    private render: Renderer2) { }

  ngOnInit() {
    this.id = this.tracker.id;
    this.color = this.tracker.color;
    this.alias = this.tracker.alias;
    this.selectSubscription = this.mapService.hasSelectedTracker.subscribe(
      (id: number) => {
        this.isSelected = this.id === id ? true : false;
      }
    );
  }

  ngOnDestroy() {
    this.selectSubscription.unsubscribe();
  }

  ngAfterViewChecked() {
    this.render.setStyle(this.colorBox.nativeElement, 'background-color', this.color);
  }

  onSelect() {
    this.mapService.onSelectedTracker(this.id);
  }

  onHide(event) {
    this.mapService.hideTracker(this.id);
    this.hidden = !this.hidden;
    event.stopPropagation();
  }

  onEdit(event) {
    this.editMode = true;
    this.render.setStyle(this.colorDot.nativeElement, 'background-color', this.color);
    this.trackerForm.setValue({color: this.color, alias: this.alias });
    event.stopPropagation();
  }

  onColorSelect(form: NgForm) {
    this.render.setStyle(this.colorDot.nativeElement, 'background-color', form.value.color);
  }

  onCancle(event) {
    this.editMode = false;
    event.stopPropagation();
  }

  onSubmit(form: NgForm) {
    this.editMode = false;
    if (this.alias !== form.value.alias) {
      this.alias = form.value.alias;
      this.mapService.updateTrackerInfo(this.index, form.value)
    }
    
    if ( this.color !==  form.value.color) {
      this.color = form.value.color;
      this.mapService.onChangeTrackerColor(this.id, this.color);
    }
    event.stopPropagation();
  }
}

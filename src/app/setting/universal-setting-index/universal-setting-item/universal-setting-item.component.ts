import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { SettingService } from './../../setting.service';
import { Setting } from '../../../shared/setting.model';
import { failScaleTrigger } from '../../setting.animation';
import { SettingState } from '../../../shared/setting-state.model';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Component({
  selector: 'app-universal-setting-item',
  templateUrl: './universal-setting-item.component.html',
  styleUrls: ['./universal-setting-item.component.css'],
  animations: [ failScaleTrigger ]
})
export class UniversalSettingItemComponent implements OnInit, OnDestroy {
  @Input() setting: Setting;
  @Input() index: number;
  settingForm: FormGroup;
  key: string;
  value: string;
  settingId: number;
  editMode = false;
  removable: boolean;
  scaleState: string;
  private settingTimer;

  updateSubscription: Subscription;

  constructor(private settingSerivce: SettingService) { }

  ngOnInit() {
    this.setValue();
    this.initForm();
    this.removable = this.settingSerivce.isRemovable(this.key);
    this.scaleState = 'default';

    this.updateSubscription = this.settingSerivce.settingUpdated.subscribe(
      (settingState: SettingState) => {
        if (this.settingId === settingState.settingId) {
          this.onSettingChanged(settingState.operation, settingState.state); }
      });
  }

  ngOnDestroy() {
    this.updateSubscription.unsubscribe();
  }

  setValue() {
    this.key = this.setting.key();
    this.value = this.setting.value();
    this.settingId = this.setting.settingId();
  }

  onEdit() {
    this.editMode = true;
  }

  initForm() {
    this.settingForm = new FormGroup({
      'id': new FormControl(this.settingId),
      'key': new FormControl(this.key, [Validators.required, Validators.max(50)]),
      'value': new FormControl(this.value, [Validators.required, Validators.max(50)]),
    });
  }

  patchForm() {
    // console.log('cahnged', this.value)
    this.settingForm.patchValue({
      'value': this.value,
      'key': this.key,
    });
  }

  onUpdate() {
    this.editMode = false;
    this.settingSerivce.updateSetting(this.settingForm.value);
  }

  onRemove() {
    if (!this.removable) {
        this.settingSerivce.settingUpdated.next(new SettingState(
        this.settingId, 0, false));
    } else {
      this.settingSerivce.removeSetting(this.settingId, this.key);
    }
  }

  onCancle() {
    this.editMode = false;
    this.patchForm();
  }

  stateFail() {
    this.scaleState = 'fail';
    setTimeout(() => {
      this.scaleState = 'default';
    }, 100);
  }

  // 0 => remove  1 => update
  // public operation: number;
  // true => success, false => fail
  // public state: boolean;
  onSettingChanged(operation: number, state: boolean) {
    // console.log(operation, state)
    switch (operation) {
      case 0:
        if (!state ) {
         this.stateFail();
        }
        break;
      case 1:
        this.setValue();
        this.patchForm();
        if (!state ) {
          this.stateFail();
         }
        // state && this.pathForm();
        break;
      default:
        break;
    }
  }

  settingValidate(control: FormControl): Observable<any> | Promise<any> {
    clearTimeout(this.settingTimer);
    if (this.editMode && control.value.trim().toLowerCase() === this.value) {
      return new Promise(resolve => resolve({'valueIsSame': true}));
    }
    // TODO: may need to value check later
    // return Observable.create((observer: Observer<any>) => {
    //   this.settingTimer = setTimeout(() => {

    //     observer.complete();
    //     }, 500);
    // });
  }
}

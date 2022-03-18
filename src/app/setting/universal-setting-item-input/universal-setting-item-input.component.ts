import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SettingService } from '../setting.service';
import { slideInTrigger, failScaleTrigger } from '../setting.animation';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Component({
  selector: 'app-universal-setting-item-input',
  templateUrl: './universal-setting-item-input.component.html',
  styleUrls: ['./universal-setting-item-input.component.css'],
  animations: [ slideInTrigger, failScaleTrigger ]
})
export class UniversalSettingItemInputComponent implements OnInit {
  settingForm: FormGroup;
  key: string;
  value: string;
  settingId: number;
  editMode = false;
  settingTimer;

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.key = '';
    this.value = '';
    this.settingId = null;
    this.initForm();
  }

  initForm() {
    this.settingForm = new FormGroup({
      'id': new FormControl(this.settingId),
      'value': new FormControl(this.value, [Validators.required, Validators.maxLength(50)]),
      'key': new FormControl(this.key , [Validators.required, Validators.maxLength(50)], this.settingValidate.bind(this)),
    });
  }

  onNew() {
    this.initForm();
    this.editMode = true;
  }

  onAdd() {
    this.editMode = false;
    this.settingService.addSetting(this.settingForm.value);
  }

  onCancle() {
    this.editMode = false;
  }

  settingValidate(control: FormControl): Observable<any> | Promise<any> {
    clearTimeout(this.settingTimer);
    // if (this.editMode && control.value.trim() === this.value) {
    //   return new Promise(resolve => resolve({'valueIsSame': true}));
    // }
   //TODO key taken check up
   //check local first
    return Observable.create((observer: Observer<any>) => {
      this.settingTimer = setTimeout(() => {
        if (this.settingService.isKeyTaken(control.value.trim().toLowerCase())) {
          observer.next({'keyIsSame': true});
        } else {
          observer.next(null);
        }
          observer.complete();
      }, 200);
    });
  }
}

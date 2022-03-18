import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { listItemSlideStateTrigger } from '../setting.animation';
import { SettingService } from './../setting.service';
import { Setting } from '../../shared/setting.model';

@Component({
  selector: 'app-universal-setting-index',
  templateUrl: './universal-setting-index.component.html',
  styleUrls: ['./universal-setting-index.component.css'],
  animations: [ listItemSlideStateTrigger ]
})
export class UniversalSettingIndexComponent implements OnInit, OnDestroy {
  private settingSubscription: Subscription;
  settings: Setting[];
  subDomain: object;

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.getLocalSettings();
    this.getCloudSettings();
    this.settingSubscription = this.settingService.settingsChanged.subscribe(() =>
      this.getLocalSettings());
  }

  ngOnDestroy() {
    this.settingSubscription.unsubscribe();
  }


  getCloudSettings() {
    this.settingService.getSettingListByOptions();
  }

  getLocalSettings() {
    this.settings = this.settingService.getSettings();
  }

  restoreSettings() {
    if (confirm('Do you want to restore the setting values to the default?')) {
      this.settingService.restoreDefaultSettings();
    }
  }
}

import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SettingService } from '../setting.service';

@Component({
  selector: 'app-setting-popup',
  templateUrl: './setting-popup.component.html',
  styleUrls: ['./setting-popup.component.css']
})
export class SettingPopupComponent implements OnInit, OnDestroy {
  display: boolean;
  popupSub: Subscription;
  title: string;
  message: string;
  connected: boolean;
  statusHasPoped: boolean;

  @ViewChild('popup') private elRef: ElementRef;

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.popupSub = this.settingService.poped.subscribe((popup: object) => this.onPopup(popup));
  }

  ngOnDestroy() {
    this.popupSub.unsubscribe();
  }

  onPopup(popup: object) {
    if (popup['host']) {
      this.title = `Backend  has changed to ${popup['host'].toUpperCase()}`;
      this.message = 'The setting will be refreshed';
    } else {
      this.title = `Something wrong...`;
      this.message = 'Try out other hosts, or changes will not be stored';
    }

    console.log('isConnected()', this.statusHasPoped );
    console.log(this.settingService.isConnected() === this.connected );
    this.statusHasPoped = this.settingService.isConnected() === this.connected ?  true : false;
    console.log('statusHaschanged', this.statusHasPoped );
    this.connected = this.settingService.isConnected();
    console.log('this.connected', this.connected );

    this.display = popup['poped'] && this.statusHasPoped;
    console.log('this.display', this.display );
  }

  // must fixed!! other wise the same id will be update
  onDismiss() {
    this.display = false;
    if (this.connected) {
      this.settingService.getSettingListByOptions();
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutSide(targetElement) {
      if (!this.elRef) {
        return;
      }
      const clickedInside = this.elRef.nativeElement.contains(targetElement);
      if (!clickedInside) {
          this.onDismiss();
      }
  }
}

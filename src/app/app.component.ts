import { SettingService } from './setting/setting.service';
import { Component } from '@angular/core';
import { appBodyInitState, appHeadInitState } from './app.animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [ appBodyInitState, appHeadInitState ]
})
export class AppComponent {

  constructor(private setting: SettingService) {

  }
}

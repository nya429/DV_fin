import { Injectable, EventEmitter } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import { API } from '../shared/host.model';
import { Setting } from '../shared/setting.model';
import { SettingState } from '../shared/setting-state.model';
import { FormGroup } from '@angular/forms';

@Injectable()
export class SettingService {
    // TODO: will eliminate id
    defaultSettings: Setting[] = [
        new Setting({key: 'host', value: 'local', id: 0}),
        new Setting({key: 'map_background_url', value: 'http://www.ubqsys.com/assets/img/solution/store_floorplan.jpg', id: 1}),
        new Setting({key: 'map_domain_x', value: '100', id: 2}),
        new Setting({key: 'map_domain_y', value: '50', id: 3}),
        new Setting({key: 'tracker_domain_x', value: '23', id: 4}),
        new Setting({key: 'tracker_domain_y', value: '20', id: 5}),
        new Setting({key: 'map_pos_offset_x', value: '0', id: 6}),
        new Setting({key: 'map_pos_offset_y', value: '0', id: 7}),
        new Setting({key: 'map_scale', value: '1', id: 8}),  ];

    settings: Setting[];

    private api;
    private subDomains;
    private httpOptions;
    private connected: boolean;

    settingsChanged = new Subject<Setting[]>();
    settingUpdated = new Subject<SettingState>();
    poped = new Subject<object>();

    constructor(private httpClient: HttpClient) {
        this.api = new API('eb');

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'my-auth-token',
            }),
            settingUrl: () => this.getApis('setting'),
          };

        this.settings = [...this.defaultSettings];
        this.populateSettings();
    }

    getSettings() {
        return [...this.settings];
    }

    // TODO add trim() in backend
    addSetting(form: object) {
        const urlSuffix = '/new';
        return this.httpClient.post(`${this.httpOptions.settingUrl()}${urlSuffix}`, form, {
          observe: 'body',
          responseType: 'json'
        }).subscribe((result) => {
            this.connected = true;
            this.addLocalSetting(form, result['data']['setting_id']);
        }, (err: HttpErrorResponse)  => {
            console.error(err);
            // TODO check 404 then
            this.connected = false;
            this.popup('opeartion', 'add');
            this.addLocalSetting(form, 40400 + this.settings.length);
        });
    }

    addLocalSetting(form: object, settingId: number) {
        form['id'] = settingId;
        const setting = new Setting(form);
        this.settings.push(setting);
        console.log(setting);
        this.settingsChanged.next(this.settings.slice());
    }

    getSettingListByOptions(offset?: number, limit?: number) {
        const urlSuffix = '/list';
        let options = new HttpParams();
        if (offset) {
          options = options.append('offset', offset.toString());
        }
        if (limit) {
          options = options.append('ltd', limit.toString());
        }
        console.log(`${this.httpOptions.settingUrl()}${urlSuffix}`);
        return this.httpClient.get(`${this.httpOptions.settingUrl()}${urlSuffix}`, {
            observe: 'body',
            responseType: 'json',
            params: options
          })
          .subscribe(
              (result) => {
                this.connected = true;
                const data = result['data'];
                const settings = data['settings'].map(
                    seetingRaw => new Setting(seetingRaw)
                  );
                this.setSettings(settings);
              }, (err: HttpErrorResponse)  => {
                 // TODO check 404 then
                this.connected = false;
                console.error(err);
                this.popup('opeartion', 'get');
              }
          );
    }

    // FIXME, this should be fixed, index -1 isssues

    removeSetting(settingId: number, key: string) {
        if (!this.isRemovable(key)) {
            this.settingUpdated.next(new SettingState(
                settingId, 0, false));
            return;
        }

        this.removeLocalSetting(settingId);

        return this.httpClient.delete(`${this.httpOptions.settingUrl()}/${settingId}`, {
            observe: 'body',
            responseType: 'json'
          }).subscribe(
            (result) => {
                this.connected = true;
            }, (err: HttpErrorResponse)  => {
              console.error(err);
                        // TODO check 404 then
            this.connected = false;
            this.popup('opeartion', 'remove');
            }
        );
    }

    removeLocalSetting(settingId: number) {
        const removal = this.settings.find(setting =>
            setting.settingId() === settingId);
        const index = this.settings.indexOf(removal);
        this.settings.splice(index, 1);
        this.settingsChanged.next(this.settings.slice());
    }

    updateMapSetting(key: string, value: string) {
        switch (key) {
            case 'offsetX':
                key = 'map_pos_offset_x';
                break;
            case 'offsetY':
                key = 'map_pos_offset_y';
                break;
            case 'scale':
                key = 'map_scale';
                break;
            default:
            break;
        }
        const index = this.getSettingIdByKey(key);
        const form = {id: index, key: key, value: value};
        this.updateSetting(form);
    }

    // TODO fix update on backend
    updateSetting(form: {id: number, key: string, value: string}) {
        const setting = new Setting(form);
        const settingId = setting.settingId();

        // TODO use key for conditioning later
        if (settingId === 0) {
            return this.updateLocalSetting(setting);
        }

        if (!settingId) {
            return false;
            // this.settingUpdated.next(new SettingState(settingId, 1, false));
        }
        return this.httpClient.patch(`${this.httpOptions.settingUrl()}/${settingId}`, form, {
            observe: 'body',
            responseType: 'json'
        }).subscribe(
            (result) => {
                this.connected = true;
                const data = result['data'];
                console.log(result);
                this.updateLocalSetting(setting);
              }, (err: HttpErrorResponse)  => {
                console.error(err);
                          // TODO check 404 then
            this.connected = false;
                this.updateLocalSetting(setting);
                this.popup('opeartion', 'update');
              }
        );
    }

    updateLocalSetting(setting: Setting) {
        let update = true;
        let fail = false;
        switch (setting.key()) {
            case 'host': // host setting
                update = this.onUpdateHost(setting, update, fail);
                break;
            default:
                fail = true;
                break;
        }

        if (update) {
            this.onLocalSettingUpdated(setting);
        }
    }

    onUpdateHost(setting: Setting, update: boolean, fail: boolean) {
         // assigned option should different from old one
        const oldValue = this.settings[0].value();
        const assignedValue = this.setHost(setting.value());
        setting.setValue(assignedValue);
        fail = assignedValue === oldValue ? true : false;
        if (fail) {
            update = false;
            this.settingUpdated.next(new SettingState(setting.settingId(), 1, false));
        } else {
            update = true;
            // FIXME => populate later?
            this.defaultSettingsLookup();
            this.popup('host', assignedValue);
        }
        return update;
    }

    onLocalSettingUpdated(newSetting: Setting) {
        const id = newSetting.settingId();
        const index = this.settings.findIndex(setting => setting.settingId() === id);
        this.settings[index] = newSetting;

        this.settingsChanged.next(this.settings.slice());
        this.settingUpdated.next(new SettingState(newSetting.settingId(), 1, true));
    }

    setHost(option: string) {
        return this.api.setHost(option);
    }

    getApis(subDomain?: string) {
        if (!subDomain) {
            return this.api.getSubdomains();
        }
        return this.api.getSubdomains()[subDomain];
    }

    isRemovable(pendingRemovalKey: string) {
        const removals = this.defaultSettings.filter(setting =>
            setting.key() === pendingRemovalKey
        );

        if ( removals && removals.length > 0  ) {
            return false;
        }
        return true;
    }

    isKeyTaken(data) {
        return this.settings.filter(setting => setting.key() === data).length > 0;
    }

    setSettings(newSettings: Setting[]) {
        // unshift host setting into the array
        // settings.unshift(this.settings[0]);
        this.settings = [this.settings[0], ...newSettings];
        this.settingsChanged.next(this.settings);
    }

    // check if defualt exist in host db, popualte the defualt setting unleess exist
    defaultSettingsLookup() {
        const urlSuffix = '/default';
        const defaultSetting = this.defaultSettings.slice();
        defaultSetting.shift();
        return this.httpClient.post(`${this.httpOptions.settingUrl()}${urlSuffix}`, defaultSetting, {
            observe: 'body',
            responseType: 'json'
        }).subscribe((result) => {
            this.connected = true;
            console.log('DEBUG', 'defualt');
            this.getSettingListByOptions();
        }, (err: HttpErrorResponse)  => {
            this.popup('opeartion', 'post');
            console.error(err);
        });
    }

    restoreDefaultSettings() {
        const urlSuffix = '/restore';
        const defaultSetting = this.defaultSettings.slice();
        defaultSetting.shift();
        return this.httpClient.post(`${this.httpOptions.settingUrl()}${urlSuffix}`, defaultSetting, {
            observe: 'body',
            responseType: 'json'
        }).subscribe((result) => {
            this.connected = true;
            console.log('DEBUG', 'defualt');
            this.getSettingListByOptions();
        }, (err: HttpErrorResponse)  => {
            this.restoreLocalSettingsToDefault();
            this.popup('opeartion', 'post');
            console.error(err);
        });
    }

    restoreLocalSettingsToDefault() {
        const newtSettings = [...this.defaultSettings];
        newtSettings.shift();
        this.setSettings(newtSettings);
    }


    populateSettings() {
        const urlSuffix = '/populate';
        const defaultSetting = this.defaultSettings.slice();
        defaultSetting.shift();
        return this.httpClient.post(`${this.httpOptions.settingUrl()}${urlSuffix}`, defaultSetting, {
            observe: 'body',
            responseType: 'json'
        }).subscribe((result) => {
            this.connected = true;
            this.getSettingListByOptions();
        }, (err: HttpErrorResponse)  => {
            this.popup('opeartion', 'get');
            console.error(err);
            // TODO check 404 then
        });
    }

    popup(key: string, value: string) {
        const popObject = {'poped': true};
        popObject[key] = value;

        setTimeout(() => {
            this.poped.next(popObject);
        }, 100);
    }

    // TODO this will be replaced by fecth
    isConnected() {
        return this.connected;
    }

    getDefaultSettingValues ()  {
        let changedSettingCount = 0;

        this.defaultSettings.forEach(defaultSetting => {
            if (defaultSetting.key() === 'host') {
                return;
            }
            this.settings.forEach(setting => {
                if (setting.key() === defaultSetting.key()) {
                    setting.setValue(defaultSetting.value());
                    changedSettingCount ++;
                }
            });
        });

        if (changedSettingCount === this.defaultSettings.length - 1) {
          // TODO matched
        } else {
            // TODO not matched populate
        }
    }

    getSettingValueByKey(key: string) {
        let settingPair = this.settings.find(setting => setting.key() === key);

        if (!settingPair) {
            settingPair = this.defaultSettings.find(setting => setting.key() === key);
        }

        return settingPair.value();
    }

    getSettingIdByKey(key: string) {
        let settingPair = this.settings.find(setting => setting.key() === key);

        if (!settingPair) {
            settingPair = this.defaultSettings.find(setting => setting.key() === key);
        }

        return settingPair.settingId();
    }

    getMapSettingBase() {
        const domain_x = this.getSettingValueByKey('map_domain_x');
        const domain_y = this.getSettingValueByKey('map_domain_x');

        return {width: +domain_x, height: +domain_y};
    }

    getMapSettingTrackerBoundary() {
        const trackerX = this.getSettingValueByKey('tracker_domain_x');
        const trackerY = this.getSettingValueByKey('tracker_domain_y');

        return {x: +trackerX, y: +trackerY};
    }

    getMapSettingPosScale() {
        const trackerX = this.getSettingValueByKey('map_pos_offset_x');
        const trackerY = this.getSettingValueByKey('map_pos_offset_y');
        const scale = this.getSettingValueByKey('map_scale');

        return {offsetX: +trackerX, offsetY: +trackerY, scale: +scale};
    }
}

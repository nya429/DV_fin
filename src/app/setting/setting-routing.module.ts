import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SettingComponent } from './setting.component';
import { UniversalSettingIndexComponent } from './universal-setting-index/universal-setting-index.component';

const settingRoutes: Routes = [
    {path: '', component: SettingComponent,
    children: [
        {path: '', redirectTo: 'universal', pathMatch: 'full'},
        {path: 'universal', component: UniversalSettingIndexComponent},
    ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(settingRoutes)
    ],
    exports: [RouterModule]
})
export class SettingRoutingModule {}

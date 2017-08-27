import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TenantsPage } from './tenants';

@NgModule({
  declarations: [
    TenantsPage,
  ],
  imports: [
    IonicPageModule.forChild(TenantsPage),
  ],
})
export class TenantsPageModule {}

import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { TenantSectionComponent } from './tenant-section';

@NgModule({
  declarations: [
    TenantSectionComponent,
  ],
  imports: [
    IonicModule,
  ],
  exports: [
    TenantSectionComponent
  ]
})
export class TenantSectionComponentModule {}

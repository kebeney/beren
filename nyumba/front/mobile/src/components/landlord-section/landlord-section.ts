import { Component } from '@angular/core';

/**
 * Generated class for the LandlordSectionComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'landlord-section',
  templateUrl: 'landlord-section.html'
})
export class LandlordSectionComponent {

  text: string;

  constructor() {
    console.log('Hello LandlordSectionComponent Component');
    this.text = 'Hello World';
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { SimpleTrip } from 'src/app/model/simple-trip';

@Component({
  selector: 'app-trip-recap',
  templateUrl: './trip-recap.component.html',
  styleUrls: ['./trip-recap.component.scss']
})
export class TripRecapComponent {

  @Input() public trip: SimpleTrip;

  constructor() { }

  public array(length: number): number[] {
    return Array(length);
  }

}

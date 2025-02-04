import { Component, OnInit, Input } from '@angular/core';
import { SimpleTrip } from 'src/app/model/simple-trip';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-trip-recap',
    templateUrl: './trip-recap.component.html',
    styleUrls: ['./trip-recap.component.scss'],
    imports: [RouterLink]
})
export class TripRecapComponent {

  @Input() public trip: SimpleTrip;

  constructor() { }

  public array(length: number): number[] {
    return Array(length);
  }

}

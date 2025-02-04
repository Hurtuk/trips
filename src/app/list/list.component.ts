import { Component, OnInit } from '@angular/core';
import { SimpleTrip } from '../model/simple-trip';
import { TripService } from '../services/trip.service';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    imports: [RouterLink, AsyncPipe]
})
export class ListComponent implements OnInit {

  public isOpen = false;

  public trips = this.tripService.getSimpleTrips();

  constructor(private tripService: TripService) { }

  ngOnInit(): void {
  }

  public array(length: number): number[] {
    return Array(length);
  }

  public isFirstOfYear(trips: SimpleTrip[], trip: SimpleTrip): boolean {
    const index = trips.indexOf(trip);
    return index === 0 || this.getYear(trips[index - 1]) != this.getYear(trip);
  }

  private getYear(trip: SimpleTrip): string {
    return trip.dates.slice(-4);
  }

}

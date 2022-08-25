import { Component, OnInit } from '@angular/core';
import { SimpleTrip } from '../model/simple-trip';
import { TripService } from '../services/trip.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
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

}

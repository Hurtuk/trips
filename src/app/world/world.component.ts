import { Component, OnInit } from '@angular/core';
import { ChartService } from '../services/chart.service';
import { TripService } from '../services/trip.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-world',
    templateUrl: './world.component.html',
    styleUrls: ['./world.component.scss'],
    imports: [AsyncPipe]
})
export class WorldComponent implements OnInit {

  public stats = this.tripService.getStats();

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  ngOnInit() {
    this.chartService.buildTheWorld('world');
  }

}

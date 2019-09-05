import { Component } from '@angular/core';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';
import { Trip } from 'src/app/model/trip';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.scss']
})
export class TripSummaryComponent implements SummaryModal {

  public trip: Trip;

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  public initFromId(id: number): void {
    this.tripService.getTripById(id)
      .subscribe(t => this.trip = t);
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart(this);
  }

  public citiesToString(): string {
    return this.trip.visits.map(v => v.city.name).join(' — ');
  }

  public array(length: number): number[] {
    return Array(length);
  }

  public getTransports(): string[] {
    return this.trip.visits.map(v => v.transport).filter(this.unique);
  }

  private unique(value, index, self): boolean {
    return self.indexOf(value) === index
  }

}

import { Component } from '@angular/core';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';
import { SimpleTrip } from 'src/app/model/simple-trip';
import { City } from 'src/app/model/city';

@Component({
  selector: 'app-city-summary',
  templateUrl: '../summary/summary.component.html',
  styleUrls: ['../summary/summary.component.scss']
})
export class CitySummaryComponent implements SummaryModal {

  public entity: City;
  public trips: SimpleTrip[];

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  public initFromId(id: string): void {
    /*this.chartService.buildCountry('aside', id);
    this.tripService.getCountryByCode(id)
      .subscribe(c => this.entity = c);*/
    this.tripService.getSimpleTrips('city', id)
      .subscribe(t => this.trips = t);
  }

  public ngOnDestroy() {
    //this.chartService.disposeTempChart();
  }

}

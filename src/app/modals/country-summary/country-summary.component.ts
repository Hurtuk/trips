import { Component } from '@angular/core';
import { Country } from 'src/app/model/country';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';
import { SimpleTrip } from 'src/app/model/simple-trip';

@Component({
  selector: 'app-country-summary',
  templateUrl: '../summary/summary.component.html',
  styleUrls: ['../summary/summary.component.scss']
})
export class CountrySummaryComponent implements SummaryModal {

  public entity: Country;
  public trips: SimpleTrip[];

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  public initFromId(id: string): void {
    this.chartService.buildCountry('aside', id);
    this.tripService.getCountryByCode(id)
      .subscribe(c => this.entity = c);
    this.tripService.getSimpleTrips('country', id)
      .subscribe(t => this.trips = t);
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart();
  }

}

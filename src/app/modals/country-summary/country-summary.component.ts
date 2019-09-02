import { Component } from '@angular/core';
import { Country } from 'src/app/model/country';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-country-summary',
  templateUrl: './country-summary.component.html',
  styleUrls: ['./country-summary.component.scss']
})
export class CountrySummaryComponent implements SummaryModal {

  public country: Country;

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  public initFromId(id: string): void {
    this.chartService.buildCountry('country-map', id);
    this.tripService.getCountryByCode(id)
      .subscribe(c => this.country = c);
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart();
  }

}

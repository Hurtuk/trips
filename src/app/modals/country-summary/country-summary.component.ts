import { Component } from '@angular/core';
import { Country } from 'src/app/model/country';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';
import { SimpleTrip } from 'src/app/model/simple-trip';
import { MatDialogRef } from '@angular/material/dialog';
import { PhotoComponent } from '../../photo/photo.component';
import { TripRecapComponent } from '../trip-recap/trip-recap.component';

@Component({
    selector: 'app-country-summary',
    templateUrl: '../summary/summary.component.html',
    styleUrls: ['../summary/summary.component.scss', '../summary/summary.component.small.scss'],
    imports: [PhotoComponent, TripRecapComponent]
})
export class CountrySummaryComponent implements SummaryModal {

  public entity: Country;
  public trips: SimpleTrip[];
  public photoUrl = null;

  constructor(
    private chartService: ChartService,
    private tripService: TripService,
    private dialogRef: MatDialogRef<CountrySummaryComponent>
  ) { }
  
  public close() {
    this.dialogRef.close();
  }

  public initFromId(id: string): void {
    this.chartService.buildCountry(this, 'aside', id);
    this.tripService.getCountryByCode(id)
      .subscribe(c => this.entity = c);
    this.tripService.getSimpleTrips('country', id)
      .subscribe(t => this.trips = t);
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart(this);
  }

}

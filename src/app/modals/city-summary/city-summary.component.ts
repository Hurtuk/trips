import { Component } from '@angular/core';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';
import { SimpleTrip } from 'src/app/model/simple-trip';
import { City } from 'src/app/model/city';
import { MatDialogRef } from '@angular/material/dialog';
import { PhotoComponent } from '../../photo/photo.component';
import { TripRecapComponent } from '../trip-recap/trip-recap.component';

@Component({
    selector: 'app-city-summary',
    templateUrl: '../summary/summary.component.html',
    styleUrls: ['../summary/summary.component.scss', '../summary/summary.component.small.scss'],
    imports: [PhotoComponent, TripRecapComponent]
})
export class CitySummaryComponent implements SummaryModal {

  public entity: City;
  public trips: SimpleTrip[];
  public photoUrl: string;

  constructor(
    private chartService: ChartService,
    private tripService: TripService,
    private dialogRef: MatDialogRef<CitySummaryComponent>
  ) { }
  
  public close() {
    this.dialogRef.close();
  }

  public initFromId(idStr: string): void {
    const id = parseInt(idStr);
    this.tripService.getCityPhoto(id)
      .subscribe(url => {
        if (url.length < 4) {
          this.chartService.buildCountry(this, 'aside', url);
        } else {
          this.photoUrl = url;
        }
      });
    this.tripService.getCityById(id)
      .subscribe(c => this.entity = c);
    this.tripService.getSimpleTrips('city', idStr)
      .subscribe(t => this.trips = t);
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart(this);
  }

}

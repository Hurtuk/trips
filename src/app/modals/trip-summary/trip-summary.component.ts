import { Component } from '@angular/core';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.scss']
})
export class TripSummaryComponent implements SummaryModal {

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  public initFromId(id: number): void {
    //throw new Error("Method not implemented.");
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart();
  }

}

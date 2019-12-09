import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TripService } from 'src/app/services/trip.service';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-costs',
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss']
})
export class CostsComponent implements OnInit, OnDestroy {

  constructor(
    private dialogRef: MatDialogRef<CostsComponent>,
    private tripService: TripService,
    private chartService: ChartService
  ) { }

  public ngOnInit() {
    this.tripService.getCosts()
      .subscribe(costs => {
        this.chartService.generateCosts(this, "chart", costs);
      });
  }
  
  public close() {
    this.dialogRef.close();
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart(this);
  }

}

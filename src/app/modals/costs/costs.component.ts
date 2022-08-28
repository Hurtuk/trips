import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TripService } from 'src/app/services/trip.service';
import { ChartService } from 'src/app/services/chart.service';
import { Cost } from 'src/app/model/cost';

@Component({
  selector: 'app-costs',
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss']
})
export class CostsComponent implements OnInit, OnDestroy {

  public excludeFrance = true;
  
  private costs: Cost[];

  constructor(
    private dialogRef: MatDialogRef<CostsComponent>,
    private tripService: TripService,
    private chartService: ChartService
  ) { }

  public ngOnInit() {
    this.tripService.getCosts()
      .subscribe(costs => {
        this.costs = costs.filter(c => c.stayCost != 0);
        this.updateCosts();
      });
  }

  public updateCosts() {
    this.chartService.generateCosts(this, "chart", this.excludeFrance ? this.costs.filter(cost => cost.foreign) : this.costs);
  }
  
  public close() {
    this.dialogRef.close();
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart(this);
  }

}

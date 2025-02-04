import { Component, Input, OnInit } from '@angular/core';
import { Trip } from '../model/trip';

@Component({
    selector: 'app-budgets',
    templateUrl: './budgets.component.html',
    styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {

  @Input() trip: Trip;

  constructor() { }

  ngOnInit(): void {
  }

  public total(): number {
    return this.trip.budgets.reduce((prev, cur) => prev + cur.amount, 0);
  }

}

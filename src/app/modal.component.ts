import { Component, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TripSummaryComponent } from './modals/trip-summary/trip-summary.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CountrySummaryComponent } from './modals/country-summary/country-summary.component';
import { SummaryModal } from './modals/summary-modal';
import { CitySummaryComponent } from './modals/city-summary/city-summary.component';
import { CostsComponent } from './modals/costs/costs.component';

@Component({
  selector: 'app-modal',
  template: '',
})
export class ModalComponent implements OnDestroy {
  destroy = new Subject<any>();
  currentDialog: MatDialogRef<any, any> = null;

  constructor(
    private modalService: MatDialog,
    route: ActivatedRoute,
    router: Router
  ) {
    route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
      let component: any;
      let displayById = false;
      if (router.url.indexOf('country') !== -1) {
        component = CountrySummaryComponent;
        displayById = true;
      } else if (router.url.indexOf('city') !== -1) {
        component = CitySummaryComponent;
        displayById = true;
      } else if (router.url.indexOf('trip') !== -1) {
        component = TripSummaryComponent;
        displayById = true;
      } else if (router.url.indexOf('costs') !== -1) {
        component = CostsComponent;
      }

      // When router navigates on this component is takes the params and opens up the photo detail modal
      this.currentDialog = this.modalService.open(component, {
        width: '1300px',
        height: '850px',
        maxWidth: '97vw',
        maxHeight: '97vh'
      });
      if (displayById) {
        (this.currentDialog.componentInstance as SummaryModal).initFromId(params.id);
      }

      // Go back to home page after the modal is closed
      this.currentDialog.afterClosed().subscribe(() => {
          router.navigateByUrl('/');
      }, () => {
          router.navigateByUrl('/');
      });
    });
  }

  ngOnDestroy() {
    this.destroy.next();
  }
}
import { Component, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TripSummaryComponent } from './modals/trip-summary/trip-summary.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CountrySummaryComponent } from './modals/country-summary/country-summary.component';
import { SummaryModal } from './modals/summary-modal';
import { CitySummaryComponent } from './modals/city-summary/city-summary.component';

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
      if (router.url.indexOf('country') !== -1) {
        component = CountrySummaryComponent;
      } else if (router.url.indexOf('city') !== -1) {
        component = CitySummaryComponent;
      } else {
        component = TripSummaryComponent;
      }

      // When router navigates on this component is takes the params and opens up the photo detail modal
      this.currentDialog = this.modalService.open(component, {
        width: '1000px',
        height: '600px',
        maxWidth: '97vw',
        maxHeight: '97vh'
      });
      (this.currentDialog.componentInstance as SummaryModal).initFromId(params.id);

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
import { Component, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TripSummaryComponent } from './modals/trip-summary/trip-summary.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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

        // When router navigates on this component is takes the params and opens up the photo detail modal
        this.currentDialog = this.modalService.open(TripSummaryComponent, {
          height: '400px',
          width: '600px',
        });
        this.currentDialog.componentInstance.photo = params.id;

        // Go back to home page after the modal is closed
        this.currentDialog.afterClosed().subscribe(result => {
            router.navigateByUrl('/');
        }, reason => {
            router.navigateByUrl('/');
        });
    });
  }

  ngOnDestroy() {
    this.destroy.next();
  }
}
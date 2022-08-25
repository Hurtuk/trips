import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-world></app-world>
    <router-outlet></router-outlet>
    <app-list></app-list>
  `,
  styles: []
})
export class AppComponent {
  title = 'trips';
}

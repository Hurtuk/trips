import { Component } from '@angular/core';
import { WorldComponent } from './world/world.component';
import { RouterOutlet } from '@angular/router';
import { ListComponent } from './list/list.component';

@Component({
    selector: 'app-root',
    template: `
    <app-world></app-world>
    <router-outlet></router-outlet>
    <app-list></app-list>
  `,
    styles: [],
    imports: [WorldComponent, RouterOutlet, ListComponent]
})
export class AppComponent {
  title = 'trips';
}

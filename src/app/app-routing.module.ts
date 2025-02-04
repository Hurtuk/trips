import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalComponent } from './modal.component';


const routes: Routes = [
  {
    path: 'country/:id',
    component: ModalComponent
  },
  {
    path: 'city/:id',
    component: ModalComponent
  },
  {
    path: 'trip/:id',
    component: ModalComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

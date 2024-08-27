import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BroadcasterLiveComponent } from './broadcaster-live/broadcaster-live.component';
import { BroadcastingComponent } from './broadcasting.component';

const routes: Routes = [
  {
    path: '',
    component: BroadcastingComponent,
    data: {
      breadcrumb: 'Broadcaster',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'broadcaster-live/:competitionId',
    component: BroadcasterLiveComponent,
    data: {
      breadcrumb: 'Broadcaster Live',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BroadcastingRoutingModule { }

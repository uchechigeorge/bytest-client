import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostsMePage } from './posts-me.page';

const routes: Routes = [
  {
    path: '',
    component: PostsMePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostsMePageRoutingModule {}

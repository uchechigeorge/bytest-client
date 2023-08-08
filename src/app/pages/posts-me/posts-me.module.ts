import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PostsMePageRoutingModule } from './posts-me-routing.module';

import { PostsMePage } from './posts-me.page';
import { PostComponentsModule } from 'src/app/components/posts/posts.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostsMePageRoutingModule,
    PostComponentsModule,
  ],
  declarations: [PostsMePage],
})
export class PostsMePageModule {}

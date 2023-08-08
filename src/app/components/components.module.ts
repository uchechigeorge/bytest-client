import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentComponent } from './comment/comment.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CommentComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  exports: [CommentComponent],
})
export class ComponentsModule {}

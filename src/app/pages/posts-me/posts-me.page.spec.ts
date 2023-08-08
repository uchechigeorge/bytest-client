import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsMePage } from './posts-me.page';

describe('PostsMePage', () => {
  let component: PostsMePage;
  let fixture: ComponentFixture<PostsMePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PostsMePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

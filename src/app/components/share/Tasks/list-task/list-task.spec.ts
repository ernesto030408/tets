import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTask } from './list-task';

describe('ListTask', () => {
  let component: ListTask;
  let fixture: ComponentFixture<ListTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

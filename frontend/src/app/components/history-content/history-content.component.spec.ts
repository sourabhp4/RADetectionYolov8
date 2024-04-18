import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryContentComponent } from './history-content.component';

describe('HistoryContentComponent', () => {
  let component: HistoryContentComponent;
  let fixture: ComponentFixture<HistoryContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

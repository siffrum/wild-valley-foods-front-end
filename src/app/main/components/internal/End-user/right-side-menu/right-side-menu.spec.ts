import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightSideMenu } from './right-side-menu';

describe('RightSideMenu', () => {
  let component: RightSideMenu;
  let fixture: ComponentFixture<RightSideMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightSideMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightSideMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

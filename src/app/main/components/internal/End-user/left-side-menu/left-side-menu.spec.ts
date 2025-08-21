import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSideMenu } from './left-side-menu';

describe('LeftSideMenu', () => {
  let component: LeftSideMenu;
  let fixture: ComponentFixture<LeftSideMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftSideMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftSideMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

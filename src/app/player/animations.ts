import { animate, style } from '@angular/animations';

export const ViewAnimationDuration = 500;

export const ViewLeaveAnimation = [
  style({
    position: 'absolute',
  }),
  animate(`${ViewAnimationDuration}ms ease-in-out`, style({ transform: 'translateX(-20%)', filter: 'opacity(0)' })),
];

export const ViewEnterAnimation = [
  style({
    position: 'absolute',
    transform: 'translateX(20%)',
    filter: 'opacity(0)',
  }),
  animate(`${ViewAnimationDuration}ms ease-in-out`, style({ transform: 'translateX(0%)', filter: 'opacity(1)' })),
];

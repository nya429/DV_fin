import { trigger, state, style, transition, animate, group, query } from '@angular/animations';

export const  appHeadInitState =  trigger('appHeadInitState', [
    transition(':enter', [
            query('nav', [style({
                transform: 'translateY(-100%)',
                opacity: 0
            }),
            animate('500ms 200ms'),
            ])
    ])
]);

export const  appBodyInitState =  trigger('appBodyInitState', [
    transition(':enter', [
        group([
            style({
                transform: 'translateX(-100%)',
                opacity: 0
            }),
            animate('500ms 700ms ease-out')
        ])
    ])
]);

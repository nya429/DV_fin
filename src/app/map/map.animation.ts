import { trigger, state, style, transition, animate, group, query, stagger, keyframes } from '@angular/animations';



export const  listItemFadeSlideStateTrigger =  trigger('listItemFadeSlideState', [
    transition('* => *', [
        query(':enter', [
            style({
                opacity: 0,
                transform: 'translateY(-4%)'
            }),
            stagger(50,
                [animate('400ms ease-out', keyframes([
                    style({
                        opacity: 0,
                        transform: 'translateY(-30%)',
                        offset: 0
                    }),
                    style({
                        opacity: .8,
                        transform: 'translateY(5%)',
                        offset: .5
                    }),
                    style({
                        opacity: 1,
                        transform: 'translateX(0)',
                        offset: 1
                    }),
                ])
            )]

        )
        ], {optional: true})
    ])
]);

export const hiddenItemStateTrigger = trigger('hiddenItemState', [
    transition(':enter', [
        style({
            opacity: 0
        }),
        animate(100, style({
            opacity: 1
        }))
    ]),
    transition(':leave', [
        style({
            opacity: 1
        }),
        animate(100, style({
            opacity: 0
        }))
    ]),
]);


export const companyFilterSlideStateTrigger = trigger('companyFilterSlideState', [
    state('all', style({
        transform: 'translateX(0)'
    })),
    state('removal', style({
        transform: 'translateX(0)'
    })),
    transition('all => removal', [
        style({
            transform: 'translateX(-14px)'
        }),
        animate(200)
    ]),
    transition('removal => all', [
        style({
            transform: 'translateX(8px)',
        }),
        animate('200ms ease-out', style({
            transform: 'translateX(0px)',
        }))
    ]),
]);

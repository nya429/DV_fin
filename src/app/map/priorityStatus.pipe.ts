import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'priorityStatus'
})
export class PriorityPipe implements PipeTransform  {
    transform(value: any) {
            switch (value) {
                case 1:
                    return 'VIP';
                case 2:
                    return 'Visitor';
                default:
                    return '';
            }
        }
}



import { Participant } from './participant.model';
export class Tracker {
    public id: number;
    public tagId: string;
    public xCrd: number;
    public yCrd: number;
    public selected: boolean;
    public activated: boolean;
    public participant: Participant;
    public color: string;

    public alias: string;
    public note: string;

    public time: number;
    public locs: any;
    public currentLoc: number;

    constructor(id: number, tag_id: string, xCrd: number, yCrd: number, participant?: Participant) {
        this.id = id;
        this.tagId = tag_id;
        this.xCrd = xCrd;
        this.yCrd = yCrd;
        this.selected = false;
        this.activated = true;
        if (participant) {
            this.participant = participant;
        }
        this.alias = participant ? participant.firstName[0] + '.' + participant.lastName : 'Tracker#' + id;
        // this.note = 'This is a tracker';
        this.color = this.participant && this.participant.priorityStatus ?
        (this.participant.priorityStatus === 1 ? 'orange' : 'deepskyblue') :
         'deepskyblue';
    }

    setCrd(x: number, y: number) {
        this.xCrd = x;
        this.yCrd = y;
    }

    setTime(time: number) {
        this.time = time;
    }

    _getCrd() {
        return {
            xCrd: this.xCrd,
            yCrd: this.yCrd
        };
    }

    isSelected() {
        return this.selected;
    }

    isActivated() {
        return this.activated;
    }

    setLocs(locs: [object], currentLoc: number) {
        this.locs = locs;
        this.currentLoc = currentLoc;
    }

    setColor(color: string) {
        this.color = color;
    }

    getColor(coloc: string) {
        return this.color;
    }

}

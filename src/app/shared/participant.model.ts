export class Participant {
    public participantId: number;
    public tagId: String;
    public companyId: Number;
    public firstName: String;
    public lastName: String;
    public companyName: String;
    public jobTitle: String;
    public email: String;
    public phone: String;
    public avatarUri: String;
    public priorityStatus: Number;
    public createTime: Number;
    public updateTime: Number;

    constructor(participant) {
        this.participantId = participant.participant_id;
        this.tagId = participant.tag_id;
        this.companyId = participant.company_id;
        this.companyName = participant.company_name;
        this.firstName = participant.first_name;
        this.lastName = participant.last_name;
        this.jobTitle = participant.job_title;
        this.email = participant.email;
        this.phone = participant.phone;
        this.avatarUri = participant.avatar_uri;
        this.priorityStatus = participant.priority_status;
        this.createTime = participant.create_time;
        this.updateTime = participant.update_time;
    }
}



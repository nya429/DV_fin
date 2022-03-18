import { FormControl, FormGroup } from '@angular/forms';
export class Company {
    public companyId: number;
    public name: string;
    public info: String;
    public addressStreet1: string;
    public addressStreet2: string;
    public addressCity: string;
    public addressState: string;
    public addressZip: string;
    public addressCountry: string;
    public contactTitle: string;
    public contactFirstName: string;
    public contactLastName: string;
    public contactPhone: string;
    public contactEmail: string;
    public avatarUri: string;
    public createTime: number;
    public updateTime: number;
    public participantCnt: number;

    constructor(company: any) {
            this.companyId = company.company_id;
            this.name = company.name;
            this.info = company.info;
            this.addressStreet1 = company.address_street_1;
            this.addressStreet2 = company.address_street_2;
            this.addressCity = company.address_city;
            this.addressState = company.address_state;
            this.addressZip = company.address_zip;
            this.addressCountry = company.address_country;
            this.contactTitle = company.contact_title;
            this.contactFirstName = company.contact_first_name;
            this.contactLastName = company.contact_last_name;
            this.contactPhone = company.contact_phone;
            this.contactEmail  = company.contact_email;
            this.avatarUri = company.avatar_uri;
            this.createTime = company.create_time;
            this.updateTime = company.update_time;
            this.participantCnt = company.p_cnt;
    }
}

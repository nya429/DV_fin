export class SettingState {
    public settingId: number;
    // 0 => remove  1 => update
    public operation: number;
    // true => success, false => fail
    public state: boolean;

    constructor(settingId: number, operation: number, state: boolean) {
        this.settingId = settingId;
        this.operation = operation;
        this.state = state;
    }
}

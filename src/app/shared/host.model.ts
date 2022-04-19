class API {
    public participant: string;
    public company: string;
    public event: string;
    public setting: string;

    private hosts = {
        'localhost': 'http://localhost:8000/api/',
        // 'aws'      : 'http://18.218.72.63:80/api/',
        'ubuntu'      : 'http://23.20.246.186:80/api/',
        'mywin'    : 'http://192.168.0.113:3000/',
        'aws': "http://dv-backend2-dev.us-east-2.elasticbeanstalk.com/api/"
    };

    constructor(hostOption: string) {
        // console.log('first set http', hostOption);
        this.setHost(hostOption);
    }

    getSubdomains() {
        // console.log('getSubdomains');
        return {
            participant: this.participant,
            company    : this.company,
            event      : this.event,
            setting    : this.setting,
        };
    }

    setHost(hostOption: string) {
        // console.log('set host', hostOption);
        let option: string = hostOption;
        if (!this.hosts[hostOption]) {
            console.log('set host invalid', hostOption);
            option = 'localhost';
        }

        const host = this.hosts[option];
        // console.log(host);
        this.participant = `${host}participant`;
        this.company    = `${host}company`;
        this.event     = `${host}map`;
        this.setting = `${host}setting`;

        return option;
    }

}

export { API };

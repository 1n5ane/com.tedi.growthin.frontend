export default class User {
    id;
    username;
    password;
    name;
    surname;
    email;
    isEmailPublic;
    phone;
    isPhonePublic;
    country;
    isCountryPublic;
    area;
    isAreaPublic;
    authorities;
    locked;
    profilePic;
    createdAt;
    updatedAt;


    constructor(params) {
        this.id = params.id || null;
        this.username = params.username;
        this.password = params.password;
        this.name = params.name;
        this.surname = params.surname;
        this.email = params.email;
        this.isEmailPublic = params.isEmailPublic || null;
        this.phone = params.phone;
        this.isPhonePublic = params.isPhonePublic || null;
        this.country = params.country;
        this.isCountryPublic = params.isCountryPublic || null;
        this.area = params.area;
        this.isAreaPublic = params.isAreaPublic || null;
        this.authorities = params.authorities;
        this.profilePic = params.profilePic || null;
    }
}
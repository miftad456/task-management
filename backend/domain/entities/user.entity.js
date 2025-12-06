export class user{
    constructor({id,name,username,email,password,createdAt}){
        this.id =  id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.password=  password;
        this.createdAt =  createdAt || new Date();
    }
    isValid(){
        return(
            this.name&&
            this.username&&
            this.email&&
            this.password&&
            this.password.length>=6
        );
    }
    toDO(){
        return {
            id : this.id,
            name : this.name,
            username: this.username,
            email: this.email,
            createdAt : this.createdAt
        };
    }
}
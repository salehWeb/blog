export interface IUser {
    id: string;
    createdAt: Date;
    email: string;
    lastName: string;
    firstName: string;
}

export interface ILogin {
    password: string
    email: string
}

export interface ISingUp {
    password: string
    firstName: string
    lastName: string
    email: string
}

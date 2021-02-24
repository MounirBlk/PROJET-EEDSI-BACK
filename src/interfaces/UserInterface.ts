import { Document } from "mongoose"
import { roleTypes } from "../types/roleTypes";

export default interface UserInterfaces extends Document {
    //_id: { $oid: string }|null|string;
    email: string;
    password: string;
    lastname: string;
    firstname: string;
    civilite: string;
    dateNaissance: string;
    role: roleTypes;
    createdAt?: Date;
    updateAt?: Date;
    lastLogin? : Date;
    portable: string;
    attempt: number;
    token?: string | null;
    idCustomer? : string;
}
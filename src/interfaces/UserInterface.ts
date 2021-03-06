import { Document, Schema } from "mongoose"
import { civiliteTypes } from "../types/civiliteTypes";
import { roleTypes } from "../types/roleTypes";

export default interface UserInterface extends Document {
    //_id: { $oid: string }|null|string;
    email: string;
    password: string;
    lastname: string;
    firstname: string;
    civilite: civiliteTypes;
    dateNaissance: string;
    role: roleTypes;
    portable: string;
    attempt?: number;
    token?: string | null;
    idCustomer? : string;
    createdAt?: Date;
    updateAt?: Date;
    lastLogin? : Date;
    disabled?: boolean;
    checked?: boolean;
    idEntreprise?: Schema.Types.ObjectId;
    idPanier?: Schema.Types.ObjectId;

    verifyPasswordSync: any;
}
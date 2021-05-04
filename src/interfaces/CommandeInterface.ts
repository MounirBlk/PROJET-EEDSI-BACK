import { Document, Schema  } from "mongoose"
import { statutCommandeTypes } from "../types/statutCommandeTypes";

export default interface CommandeInterface extends Document {
    "refID": string,
    "clientID": string,//Schema.Types.ObjectId
    "livreurID": string,//Schema.Types.ObjectId
    "dateLivraison": string,// YYYY-MM-DD hh:mm
    "adresseLivraison": string,
    "statut": statutCommandeTypes,
    "articles": Array<string>//idProductSelected
    "typeSignalement" :string,
    "objetSignalement" :string,
    "cheminSignature" :string
}
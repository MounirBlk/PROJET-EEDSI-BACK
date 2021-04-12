import { Document } from "mongoose"
import { statutCommandeTypes } from "../types/statutCommandeTypes";

export default interface CommandeInterface extends Document {
    "refID": string,
    "clientID": string,
    "livreurID": string,
    "dateLivraison": Date,// YYYY-MM-DD hh:mm
    "adresseLivraison": string,
    "statut": statutCommandeTypes,
    "articles": Array<string>//idProductSelected
}
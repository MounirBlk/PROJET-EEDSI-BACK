import { Document, Schema } from "mongoose"
import ComposantSelectedInterface from "./ComposantSelectedInterface";

export default interface ProduitSelectedInterface extends Document {
    "refID": string,
    "idProduct": Schema.Types.ObjectId,
    "matiere": string,
    "couleur": string,
    //"longueur": number,
    //"largeur": number,
    //"profondeur": number,
    //"poids": number,
    "imgLinkSelected"?: string;
    "quantite": number,//
    "isCommande": boolean,
    "listeComposantsSelected": Array<ComposantSelectedInterface>//idComposantSelected
}
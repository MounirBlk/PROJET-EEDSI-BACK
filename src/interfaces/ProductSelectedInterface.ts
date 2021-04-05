import { Document } from "mongoose"

export default interface ProduitSelectedInterface extends Document {
    "refID": string,
    "idProduct": string,
    "matiere": string,
    "couleur": string,
    //"longueur": number,
    //"largeur": number,
    //"profondeur": number,
    //"poids": number,
    "imgLinkSelected"?: string;
    "quantite": number,//
    "listeComposantsSelected": Array<string>//idComposantSelected
}
import { Document } from "mongoose"

export default interface ProductInterface extends Document {
    "refID": number,
    "nom": string,
    "type": string,
    "sousType": string,
    "matieres": Array<string>,
    "couleurs": Array<string>,
    "poids": number,
    "longueur": number,
    "largeur": number,
    "profondeur": number,
    "prix": number,
    "taxe": number,
    "quantité": number,
    "composants": Array<any>
}
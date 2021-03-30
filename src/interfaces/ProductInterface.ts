import { Document } from "mongoose"

export default interface ProductInterface extends Document {
    "refID": string,
    "nom": string,
    "description": string,
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
    "quantite": number,
    "composants": Array<string>,
    "idStripeProduct": string
}
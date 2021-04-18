import { Document, Schema } from "mongoose"

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
    "composants": Array<Schema.Types.ObjectId>,// ?
    "idStripeProduct": string,
    "idStripePrice": string,
    "imgLink": string,
    "tabImgLinks": Array<string>,
    "archive": boolean
}
//NON DISPONIBLE if archive = true ou quantite = 0
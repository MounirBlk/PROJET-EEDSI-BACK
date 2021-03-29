import { Document } from "mongoose"

export default interface ComposantInterface extends Document {
    "refID": string,
    "nom": string,
    "type": string,
    "matieres": Array<string>,
    "couleurs": Array<string>,
    "poids": number,
    "longueur": number,
    "largeur": number,
    "profondeur": number,
    "prix": number,
    "quantite": number,
}

import { Document } from "mongoose"

export default interface ComposantSelectedInterface extends Document {
    "refID": string,
    "idComposant": string,
    "matiere": string,
    "couleur": string,
    "quantite": number
}
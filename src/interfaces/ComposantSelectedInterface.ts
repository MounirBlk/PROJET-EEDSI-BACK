import { Document, Schema } from "mongoose"

export default interface ComposantSelectedInterface extends Document {
    "refID": string,
    "idComposant": Schema.Types.ObjectId,
    "matiere": string,
    "couleur": string,
    "quantite": number
}
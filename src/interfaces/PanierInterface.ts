import { Document, Schema } from "mongoose"

export default interface PanierInterface extends Document {
    refID: string,
    articles: Array<Schema.Types.ObjectId>//idProductSelected
}

/*interface ArticlePanier extends Document {
    idProductSelected: string;
    //quantity: number;
}*/
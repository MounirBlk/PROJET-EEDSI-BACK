import { Document } from "mongoose"

export default interface PanierInterface extends Document {
    idUser: string;
    articles: Array<string>;//idProductSelected
}

/*interface ArticlePanier extends Document {
    idProductSelected: string;
    //quantity: number;
}*/
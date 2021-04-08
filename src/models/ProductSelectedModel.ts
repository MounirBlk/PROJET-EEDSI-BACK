import * as mongoose from 'mongoose';
import ProductSelectedInterface from '../interfaces/ProductSelectedInterface';

const ProductSelectedSchema = new mongoose.Schema<ProductSelectedInterface>({
    refID: {
        trim: true,
        index: true,
        type: String,
        unique: true,
    },
    idProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductModel',
        required: false,
        default: null
    },
    matiere: {
        type: String,
        required: true,
        default: null
    },
    couleur: {
        type: String,
        required: true,
        default: null
    },
    /*poids: {
        default: null,
        type: Number,
        required: true
    },
    longueur: {
        default: null,
        type: Number,
        required: true
    }, 
    largeur: {
        default: null,
        type: Number,
        required: true
    }, 
    profondeur: {
        default: null,
        type: Number,
        required: true
    }, */
    quantite: {
        default: null,
        type: Number,
        required: true
    },
    imgLinkSelected: {
        type: String,
        required: false,
        default: null
    },
    isCommande: {
        type: Boolean,
        required: true,
        default: false
    },
    listeComposantsSelected: {
        type: [{ 
            "idComposant": {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ComposantModel',
                required: false,
                default: null
            }, 
            "matiere": String, 
            "couleur": String, 
            "quantite": Number 
        }],
        required: false,
        default: undefined
    },
    createdAt: {
        default: new Date(),
        type: Date,
        required: false
    },
    updateAt: {
        default: new Date(),
        type: Date,
        required: false
    },
}, {
    collection: "articles",// article
    timestamps: true,
    autoCreate: true
});

ProductSelectedSchema.index({
    refID: 1
});

export default mongoose.model<ProductSelectedInterface>("ProductSelectedModel", ProductSelectedSchema);
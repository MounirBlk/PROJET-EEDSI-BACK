import * as mongoose from 'mongoose';
import ProductInterface from '../interfaces/ProductInterface';

const ProductSchema = new mongoose.Schema<ProductInterface>({
    refID: {
        trim: true,
        index: true,
        type: String,
        unique: true,
    },
    nom: {
        default: null,
        type: String,
        required: true
    },
    description: {
        default: null,
        type: String,
        required: false
    },
    type: {
        default: null,
        type: String,
        required: true
    },
    sousType: {
        default: null,
        type: String,
        required: false
    },
    matieres: {
        type: [String],
        required: true,
        default: undefined
    },
    couleurs: {
        type: [String],
        required: true,
        default: undefined
    },
    poids: {
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
    }, 
    prix: {
        default: null,
        type: Number,
        required: true
    }, 
    taxe: {
        default: null,
        type: Number,
        required: true
    },
    quantite: {
        default: null,
        type: Number,
        required: true
    },
    composants: {
        type: [String],
        required: false,
        default: undefined
    },
    idStripeProduct:{
        default: null,
        type: String,
        required: false
    },
    idStripePrice:{
        default: null,
        type: String,
        required: false
    },
    imgLink:{
        default: null,
        type: String,
        required: false
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
    collection: "produits",
    timestamps: true,
    autoCreate: true
});

ProductSchema.index({
    refID: 1
});

export default mongoose.model<ProductInterface>("ProductModel", ProductSchema);
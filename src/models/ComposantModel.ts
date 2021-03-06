import * as mongoose from 'mongoose';
import ComposantInterface from '../interfaces/ComposantInterface';

const ComposantSchema = new mongoose.Schema<ComposantInterface>({
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
        required: true
    },
    type: {
        default: null,
        type: String,
        required: true
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
    quantite: {
        default: null,
        type: Number,
        required: true
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
    tabImgLinks:{
        default: undefined,
        type: [String],
        required: false
    },
    archive:{
        default: false,
        type: Boolean,
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
    collection: "composants",
    timestamps: true,
    autoCreate: true
});

ComposantSchema.index({
    refID: 1
});

export default mongoose.model<ComposantInterface>("ComposantModel", ComposantSchema);
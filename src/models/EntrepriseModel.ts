import { NextFunction } from 'express';
import * as mongoose from 'mongoose';
import EntrepriseInterface from '../interfaces/EntrepriseInterface';

const EntrepriseSchema = new mongoose.Schema<EntrepriseInterface>({
    siret: {
        type: Number,
        index: true,
        unique: true
    },
    siren: {
        default: null,
        type: Number,
        required: false
    },
    nom: {
        default: null,
        type: String,
        required: false
    },
    adresse: {
        default: null,
        type: String,
        required: false
    },
    telephone: {
        default: null,
        type: String,
        required: false
    },
    numeroTvaIntra:{
        default: null,
        type: String,
        required: false
    },
    categorieJuridique: {
        default: null,
        type: Number,
        required: false
    },
    categorieEntreprise: {
        default: null,
        type: String,
        required: false
    },
    dateCreation: {
        default: null,
        type: String,
        required: false
    },
    etatAdministratif: {
        type: String,
        default: null,
        enum: ["Actif", "Ferme"],
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
    }
}, {
    collection: "entreprises",
    timestamps: true,
    autoCreate: true
});

EntrepriseSchema.index({
    siret: 1
});

export default mongoose.model<EntrepriseInterface>("EntrepriseModel", EntrepriseSchema);
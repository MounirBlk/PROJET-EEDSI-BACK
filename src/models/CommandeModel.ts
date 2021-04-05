import * as mongoose from 'mongoose';
import CommandeInterface from '../interfaces/CommandeInterface';

const CommandeSchema = new mongoose.Schema<CommandeInterface>({
    refID: {
        trim: true,
        index: true,
        type: String,
        unique: true,
    },
    clientID: {
        default: null,
        type: String,
        required: true
    },
    livreurID: {
        default: null,
        type: String,
        required: true
    },
    dateLivraison: {
        default: null,
        type: String,
        required: true
    },
    adresseLivraison: {
        default: null,
        type: String,
        required: true
    },
    statut: {
        type: String,
        default: "Attente",
        enum: ["Attente", "EnCours", "Signalement", "Termine"],
    },
    articles: {//idProductSelected
        type: [String],
        required: true,
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
    collection: "commandes",
    timestamps: true,
    autoCreate: true
});

CommandeSchema.index({
    refID: 1
});

export default mongoose.model<CommandeInterface>("CommandeModel", CommandeSchema);
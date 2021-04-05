import * as mongoose from 'mongoose';
import ComposantSelectedInterface from '../interfaces/ComposantSelectedInterface';

const ComposantSelectedSchema = new mongoose.Schema<ComposantSelectedInterface>({
    refID: {
        trim: true,
        index: true,
        type: String,
        unique: true,
    },
    idComposant: {
        default: null,
        type: String,
        required: true
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
    quantite: {
        default: null,
        type: Number,
        required: true
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
    collection: "composants_selected",
    timestamps: true,
    autoCreate: true
});

ComposantSelectedSchema.index({
    refID: 1
});

export default mongoose.model<ComposantSelectedInterface>("ComposantSelectedModel", ComposantSelectedSchema);
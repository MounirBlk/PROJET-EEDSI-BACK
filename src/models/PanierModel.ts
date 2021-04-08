import * as mongoose from 'mongoose';
import PanierInterface from '../interfaces/PanierInterface';

const PanierSchema = new mongoose.Schema<PanierInterface>({
    refID: {
        trim: true,
        index: true,
        type: String,
        unique: true,
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSelectedModel',
        required: false,
        default: null
    }],
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
    collection: "panier",
    timestamps: true,
    autoCreate: true
});

PanierSchema.index({
    refID: 1
});

export default mongoose.model<PanierInterface>("PanierModel", PanierSchema);
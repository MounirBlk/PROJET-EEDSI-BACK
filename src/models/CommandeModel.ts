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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true,
    },
    livreurID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: false,
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
        enum: ["All", "Attente", "Livraison", "Signalement", "Termine"],
    },
    prixTotal: {
        default: 0,
        type: Number,
        required: true
    },
    articles:{
        type: [{ 
            "idProduct": {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductModel',
                required: false,
                default: null
            }, 
            "imgLinkSelected": {
                type: String,
                required: false,
                default: null
            },
            "refID": String, 
            "matiere": String, 
            "couleur": String, 
            "quantite": Number,
            "isCommande": Boolean, 
            "listeComposantsSelected": {
                type:[{
                    idComposant:{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'ComposantModel',
                        required: false,
                        default: null
                    },
                    "imgLinkSelected": {
                        type: String,
                        required: false,
                        default: null
                    },
                    "matiere": String, 
                    "couleur": String, 
                    "quantite": Number 
                }],
                required: false,
                default: undefined
            }
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
    collection: "commandes",
    timestamps: true,
    autoCreate: true
});

CommandeSchema.index({
    refID: 1
});

export default mongoose.model<CommandeInterface>("CommandeModel", CommandeSchema);
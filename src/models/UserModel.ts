import * as mongoose from 'mongoose';
import UserInterface from '../interfaces/UserInterface';
const bcrypt = require("mongoose-bcrypt");

const UserSchema = new mongoose.Schema<UserInterface>({
    email: {
        trim: true,
        index: true,
        type: String,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        bcrypt: true,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    dateNaissance: {
        type: String,
    },
    civilite: {
        type: String,
        default: "Homme",
        enum: ["Homme", "Femme"],
    },
    portable: {
        default: null,
        type: String,
        require: false
    },
    role: {
        type: String,
        //default: "Client",
        enum: ["Administrateur", "Commercial", "Livreur", "Client"],
    },
    attempt: {
        default: 0,
        type: Number,
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
    lastLogin: {
        default: new Date(),
        type: Date,
        required: false
    },
    token: {
        default: null,
        type: String,
        required: false
    },
    idCustomer: {
        default: null,
        type: String,
        required: false
    },
    disabled: {
        default: false,
        type: Boolean,
        required: false
    },
    checked: {
        default: false,
        type: Boolean,
        required: false
    },

}, {
    collection: "users",
    timestamps: true,
    autoCreate: true
});

UserSchema.plugin(bcrypt);
UserSchema.index({
    email: 1
});

export default mongoose.model<UserInterface>("UserModel", UserSchema);
import * as mongoose from 'mongoose';
import ChatInterface from '../interfaces/ChatInterface';

const ChatSchema = new mongoose.Schema<ChatInterface>({
    refID: {
        trim: true,
        index: true,
        type: String,
        unique: true,
    },
    userInfos: {
        type: {
            "role": {
                type: String,
                required: true,
                default: null
            },
            "firstname": {
                type: String,
                required: true,
                default: null
            },
            "lastname": {
                type: String,
                required: true,
                default: null
            }
        },
        ref: 'UserModel',
        required: false,
    },
    username:{
        type: String,
        required: false
    },
    message:{
        type: String,
        required: true
    },
    createdAt: {
        default: new Date(),
        type: Date,
        required: false
    },
}, {
    collection: "chat",
    timestamps: true,
    autoCreate: true
});

ChatSchema.index({
    refID: 1
});

export default mongoose.model<ChatInterface>("ChatModel", ChatSchema);
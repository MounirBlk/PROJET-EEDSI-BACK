import { Document, Schema } from "mongoose"

export default interface ChatInterface extends Document {
    "refID": string,
    "userInfos": userInfosInterface,
    "username": string,
    "message": string,
    "isViewed": boolean
}

interface userInfosInterface {
    role: string,
    firstname: string,
    lastname: string
}
import * as socketio from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import UserInterface from "../interfaces/UserInterface";
import ChatModel from "../models/ChatModel";
import { v4 as uuidv4 } from 'uuid';
import { CallbackError } from "mongoose";
import ChatInterface from "../interfaces/ChatInterface";
import { getJwtPayload, payloadTokenInterface, dataResponse, deleteMapper, exist } from ".";
import UserModel from "../models/UserModel";

export default async(io: socketio.Server<DefaultEventsMap, DefaultEventsMap>): Promise<void> => {
    let users: any[] = [];
    let messages: any[] = [];
    console.log('SocketIO OK !')
    io.on("connection", (socket: socketio.Socket<DefaultEventsMap, DefaultEventsMap> | any) => {
        /* Chat box */
        socket.emit('loggedIn', {
            users: users.map(s => s.username),//all users logged -> socket
            //messages: socket.messages
        });

        socket.on('newUser', async(token: string) => {
            await getJwtPayload('Bearer ' + token).then(async (payload: payloadTokenInterface | null) => {
                if(payload !== null && payload !== undefined){
                    const user: any = deleteMapper(await UserModel.findById(payload.id).populate('idEntreprise').populate('idPanier'));
                    console.log(`${user.firstname} ${user.lastname} has arrived at the party.`);
                    socket.username = `${user.firstname} ${user.lastname}`;
                    socket.userInfos = {
                        role: user.role,
                        firstname: user.firstname,
                        lastname: user.lastname
                    };
                    users.push(socket);
                    io.emit('userOnline', socket.username);
                }
            });
        });

        socket.on('newMessage', (message: string) => {
            let messageToSave = new ChatModel({
                refID: uuidv4(),
                username: socket.username,
                userInfos: socket.userInfos,
                message: message,
                createdAt: new Date(),
                isViewed: false,
            });
            messageToSave.save((err, result: ChatInterface) => {
                if (err) throw err;
                messages.push(result);
                io.emit('getMessage', result);
            });
        });

        socket.on('getMessagesDB', async() => {
            const response: ChatInterface[] = await ChatModel.find({})
            socket.messages = response;
            io.emit('getAllMessages', socket.messages)
        });

        socket.on("resetMessages", async() => {
            await ChatModel.deleteMany({});
            io.emit('getMessagesEmpty', []);
        });

        //Disconnect
        socket.on("disconnect", () => {
            if(exist(socket.username)){
                console.log(`${socket.username} has left the party.`);
                io.emit('userLeft', socket.username)
                users.splice(users.indexOf(socket), 1);
            }
        });
    });
}
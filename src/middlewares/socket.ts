import * as socketio from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import UserInterface from "../interfaces/UserInterface";
import ChatModel from "../models/ChatModel";
import { v4 as uuidv4 } from 'uuid';
import { CallbackError } from "mongoose";
import ChatInterface from "../interfaces/ChatInterface";
import { getJwtPayload, payloadTokenInterface, dataResponse } from ".";
import UserModel from "../models/UserModel";

export default async(io: socketio.Server<DefaultEventsMap, DefaultEventsMap>): Promise<void> => {
    let users: any[] = [];
    let messages: any[] = [];
    const response: ChatInterface[] = await ChatModel.find({})
    await ChatModel.deleteMany({})
    if (response){
        messages = response;
        console.log('SocketIO OK !')
        io.on("connection", (socket: socketio.Socket<DefaultEventsMap, DefaultEventsMap> | any) => {
            socket.emit('loggedIn', {
                users: users.map(s => s.username),
                messages: messages
            });

            socket.on('newuser', async(token: string) => {
                await getJwtPayload('Bearer ' + token).then(async (payload: payloadTokenInterface | null) => {
                    if(payload !== null && payload !== undefined){
                        const user: any = await UserModel.findById(payload.id);
                        console.log(`${user.firstname} ${user.lastname} has arrived at the party.`);
                        socket.username = `${user.firstname} ${user.lastname}`;
                        socket.userInfos = {
                            role: user.role,
                            firstname: user.firstname,
                            lastname: user.lastname
                        };
                        users.push(socket);
                        io.emit('userOnline', socket.user);
                    }
                });
            });

            socket.on('msg', (message: string) => {
                let messageToSave = new ChatModel({
                    refID: uuidv4(),
                    username: socket.username,
                    userInfos: socket.userInfos,
                    message: message,
                    createdAt: new Date()
                });
                messageToSave.save((err, result: any) => {
                    if (err) throw err;
                    messages.push(result);
                    io.emit('msg', result);
                });
            });

            //Disconnect
            socket.on("disconnect", () => {
                console.log(`${socket.username} has left the party.`);
                io.emit('userLeft', socket.username)
                users.splice(users.indexOf(socket), 1);
            });
        });
    }
}
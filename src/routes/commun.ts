import { Application, Request, Response, NextFunction, Errback } from "express";
import { deleteUser, disableUser, forgotPassword, getUser, login, register, updateUser } from "../controllers/user";

export const commun = (app: Application): void => {
    app.route('/register').post(register);
    app.route('/login').post(login);
    app.route('/user').delete(deleteUser);
    app.route('/user').get(getUser);
    app.route('/user').put(updateUser);
    app.route('/disable').put(disableUser);
    app.route('/forgot').put(forgotPassword);// TO PERFORM LATER
}
import { Application, Request, Response, NextFunction, Errback } from "express";
import { deleteUser, getUser, login, register } from "../controllers/user";

export const commun = (app: Application): void => {
    app.route('/register').post(register);
    app.route('/login').post(login);
    app.route('/user').delete(deleteUser);
    app.route('/user').get(getUser);
}
import { Application, Request, Response, NextFunction, Errback } from "express";
import { login, register } from "../controllers/user";

export const commun = (app: Application): void => {
    app.route('/register').post(register)
    app.route('/login').post(login)
}
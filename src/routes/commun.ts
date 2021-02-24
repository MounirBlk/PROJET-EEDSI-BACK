import { Application, Request, Response, NextFunction, Errback } from "express";
import { login } from "../controllers/user";

export const commun = (app: Application): void => {
    app.route('/login').post(login)
}
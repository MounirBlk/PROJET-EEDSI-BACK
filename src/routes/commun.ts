import { Application, Request, Response, NextFunction, Errback } from "express";
import { checkEmail, deleteUser, disableUser, forgotPassword, getUser, login, register, updateUser } from "../controllers/user";
import { checkInternet } from "../middlewares";

export default (app: Application): void => {
    app.route('/register').post(checkInternet, register);
    app.route('/login').post(checkInternet, login);
    app.route('/user').delete(checkInternet, deleteUser);
    app.route('/user').get(checkInternet, getUser);
    app.route('/user').put(checkInternet, updateUser);
    app.route('/disable').put(checkInternet, disableUser);
    app.route('/forgot').put(checkInternet, forgotPassword);// TO PERFORM LATER
    app.route('/check/:token').get(checkInternet, checkEmail);
}
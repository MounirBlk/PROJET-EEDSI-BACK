import { Application, Request, Response, NextFunction, Errback } from "express";
import { addProduct, deleteProduct } from "../controllers/product";
import { checkEmail, deleteUser, disableUser, forgotPassword, getAllUsers, getOneUser, getOwnUser, login, register, updateUser } from "../controllers/user";
import { checkInternet, dataResponse } from "../middlewares";

export default (app: Application): void => {
    //USER
    app.route('/register').post(checkInternet, register);
    app.route('/login').post(checkInternet, login);
    app.route('/user/delete/:id').delete(checkInternet, deleteUser);
    app.route('/user/one/:id').get(checkInternet, getOneUser);
    app.route('/user/own').get(checkInternet, getOwnUser);
    app.route('/user/all/:role').get(checkInternet, getAllUsers);
    app.route('/user/update/:id').put(checkInternet, updateUser);
    app.route('/user/disable/:id').put(checkInternet, disableUser);
    app.route('/user/forgot').put(checkInternet, forgotPassword);
    app.route('/user/check/:token').get(checkInternet, checkEmail);

    //PRODUCT
    app.route('/product/add').post(checkInternet, addProduct);
    app.route('/product/delete/:id').delete(checkInternet, deleteProduct);
}
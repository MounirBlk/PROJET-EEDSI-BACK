import { Application, Request, Response, NextFunction, Errback } from "express";
import { addComposant, deleteComposant, getComposant, getAllComposants, updateComposant } from "../controllers/composant";
import { addProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from "../controllers/product";
import { checkEmail, deleteUser, disableUser, forgotPassword, getAllUsers, getOneUser, getOwnUser, login, register, updateUser } from "../controllers/user";
import { checkInternet, dataResponse } from "../middlewares";
import multer from "multer";
import { initUpload } from "../config";
import { addCommande, deleteCommande, getCommande, getAllCommandesByStatut, updateCommande, getAllCommandesByUser } from "../controllers/commande";
import { getFactureMail } from "../controllers/facture";

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
    app.route('/product/add').post(checkInternet, multer(initUpload()).any(), addProduct);
    app.route('/product/delete/:id').delete(checkInternet, deleteProduct);
    app.route('/product/one/:id').get(checkInternet, getProduct);
    app.route('/product/all').get(checkInternet, getAllProducts);
    app.route('/product/update/:id').put(checkInternet, multer(initUpload()).any(), updateProduct);

    //COMPOSANT
    app.route('/composant/add').post(checkInternet, multer(initUpload()).any(), addComposant);
    app.route('/composant/delete/:id').delete(checkInternet, deleteComposant);
    app.route('/composant/one/:id').get(checkInternet, getComposant);
    app.route('/composant/all').get(checkInternet, getAllComposants);
    app.route('/composant/update/:id').put(checkInternet, multer(initUpload()).any(), updateComposant);

    //COMMANDE (ATTENTE/LIVRAISON/SIGNALEMENT/TERMINE/ALL)
    app.route('/commande/add').post(checkInternet, addCommande);
    app.route('/commande/delete/:id').delete(checkInternet, deleteCommande);
    app.route('/commande/one/:id').get(checkInternet, getCommande);
    app.route('/commande/all/:statut').get(checkInternet, getAllCommandesByStatut);
    app.route('/commande/user/:role/:id').get(checkInternet, getAllCommandesByUser);//payload token ?
    app.route('/commande/update/:id').put(checkInternet, updateCommande);

    //FACTURE
    app.route('/facture/one/:id').get(checkInternet, getFactureMail);

}
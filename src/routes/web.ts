import { Application, Request, Response, NextFunction, Errback } from "express";
import { addArticle, deleteArticle, getArticle, getAllArticles, updateArticle } from "../controllers/panier";
import { checkInternet } from "../middlewares";

export default (app: Application): void => {
    //PANIER
    app.route('/panier/add').post(checkInternet, addArticle);
    app.route('/panier/delete/:id').delete(checkInternet, deleteArticle);
    app.route('/panier/one/:id').get(checkInternet, getArticle);
    app.route('/panier/all').get(checkInternet, getAllArticles);
    app.route('/panier/update/:id').put(checkInternet, updateArticle);
}
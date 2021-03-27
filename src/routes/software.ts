import { Application, Request, Response, NextFunction, Errback } from "express";
import { deleteEntreprise, getAllEntreprises, getEntreprise, newEntrepriseAuto, newEntreprise, updateEntreprise } from "../controllers/entreprise";
import { checkInternet } from "../middlewares";

export default (app: Application): void => {
    app.route('/entreprise/auto').post(checkInternet, newEntrepriseAuto);
    app.route('/entreprise').post(checkInternet, newEntreprise);
    app.route('/entreprise/:id').put(checkInternet, updateEntreprise);
    app.route('/entreprise/:id').delete(checkInternet, deleteEntreprise);
    app.route('/entreprise/:id').get(checkInternet, getEntreprise);
    app.route('/entreprises').get(checkInternet, getAllEntreprises);
}
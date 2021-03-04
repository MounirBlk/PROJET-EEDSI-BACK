import { Application, Request, Response, NextFunction, Errback } from "express";
import { deleteEntreprise, getAllEntreprises, getEntreprise, newEntreprise, updateEntreprise } from "../controllers/entreprise";

export default (app: Application): void => {
    app.route('/entreprise').post(newEntreprise);
    app.route('/entreprise/:id').put(updateEntreprise);
    app.route('/entreprise/:id').delete(deleteEntreprise);
    app.route('/entreprise/:id').get(getEntreprise);
    app.route('/entreprises').get(getAllEntreprises);
}
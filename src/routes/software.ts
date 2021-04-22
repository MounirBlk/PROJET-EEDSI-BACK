import { Application, Request, Response, NextFunction, Errback } from "express";
import { deleteEntreprise, getAllEntreprises, getEntreprise, newEntrepriseAuto, newEntreprise, updateEntreprise } from "../controllers/entreprise";
import { generateDevisMail } from "../controllers/facture";
import { checkInternet, dataResponse } from "../middlewares";
import { generateInvoice } from "../middlewares/invoice";

export default (app: Application): void => {
    app.route('/entreprise/auto').post(checkInternet, newEntrepriseAuto);
    app.route('/entreprise').post(checkInternet, newEntreprise);
    app.route('/entreprise/:id').put(checkInternet, updateEntreprise);
    app.route('/entreprise/:id').delete(checkInternet, deleteEntreprise);
    app.route('/entreprise/:id').get(checkInternet, getEntreprise);
    app.route('/entreprises').get(checkInternet, getAllEntreprises);

    //Devis
    app.route('/devis/add/:id').post(checkInternet, generateDevisMail);

    //Synchronisation
    app.route('/synchro').get(checkInternet, async(req: Request, res: Response): Promise<any> => {
        return dataResponse(res, 200, { error: false, message: "SYNCHRO" });
    }); //synchronise les données de la base
}
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, dateHourMinuFormatEn, deleteMapper, exist, existTab, firstLetterMaj, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import { CallbackError, FilterQuery, Schema } from 'mongoose';
import CommandeModel from '../models/CommandeModel';
import { mailInvoice } from '../middlewares/sendMail';
import { generateInvoice, getInvoiceData } from '../middlewares/invoice';

/**
 *  Route envoie devis par mail
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const generateDevisMail = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;//idUSER
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await CommandeModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    CommandeModel.findOne({ _id: id}).populate('clientID').populate('livreurID').populate('articles.idProduct').populate('articles.listeComposantsSelected.idComposant').exec(async(err: CallbackError, data: any) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (data === undefined || data === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        }else{
                            await generateInvoice(getInvoiceData(data), data.refID);
                            await mailInvoice(data.clientID.email, `${data.clientID.firstname} ${data.clientID.lastname}`, data.refID);
                            return dataResponse(res, 201, { error: false, message: "La facture a bien été envoyé par mail" });
                        }
                    });
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}
import { Application, Request, Response, NextFunction, Errback } from 'express';
import UserInterfaces from '../interfaces/UserInterface';
import { dataResponse, dateFormatFr, emailFormat, exist, passwordFormat, textFormat } from '../middlewares';
import { mailRegister } from '../middlewares/sendMail';
import UserModel from '../models/UserModel';

/**
 *  Route login user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const login = async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    //TO DO
    return dataResponse(res, 200, { error: false, message: 'ok'});
}

/**
 *  Route register user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const register = async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    if(data === undefined || data === null) return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes'})
    if(!exist(data.email) || !exist(data.password) || !exist(data.firstname) || !exist(data.lastname) || 
    !exist(data.dateNaissance) || !exist(data.civilite) || !exist(data.role)){
        return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
    }else{
        if(!emailFormat(data.email) || !passwordFormat(data.password) || !textFormat(data.firstname) || !textFormat(data.lastname) || !dateFormatFr(data.dateNaissance) || 
        (data.civilite.toLowerCase() !== "homme" && data.civilite.toLowerCase() !== "femme") || (data.role.toLowerCase() !== "administrateur" && data.role.toLowerCase() !== "commercial" && data.role.toLowerCase() !== "livreur" && data.role.toLowerCase() !== "client")){
            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
        }else{
            if(true !== true){// Email already exist

            }else{
                let toInsert = {
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                    firstname: data.firstname.trim().charAt(0).toUpperCase() + data.firstname.trim().substring(1).toLowerCase(),
                    lastname: data.lastname.trim().charAt(0).toUpperCase() + data.lastname.trim().substring(1).toLowerCase(),
                    dateNaissance: data.dateNaissance.trim(),
                    civilite: data.civilite.trim(),
                    portable: exist(data.portable) ? data.portable : null,
                    role: data.role
                };
                let user: UserInterfaces = new UserModel(toInsert);
                await user.save().then(async(user: UserInterfaces) => {
                    await mailRegister(user.email, `${user.firstname} ${user.lastname}`);
                    return dataResponse(res, 201, { error: false, message: "L'utilisateur a bien été créé avec succès" });
                }).catch((error) => {
                    return dataResponse(res, 409, { error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré" });
                });
            }
        }
    }
}
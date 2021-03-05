import { Application, Request, Response, NextFunction, Errback } from 'express';
import UserInterface from '../interfaces/UserInterface';
import { dataResponse, dateFormatFr, deleteMapper, emailFormat, exist, getJwtPayload, isEmptyObject, isValidLength, passwordFormat, randChars, randomNumber, textFormat } from '../middlewares';
import { mailCheckEmail, mailforgotPw, mailRegister } from '../middlewares/sendMail';
import UserModel from '../models/UserModel';
import jwt from 'jsonwebtoken';

/**
 *  Route register user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const register = async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    if(isEmptyObject(data) || !exist(data.email) || !exist(data.password) || !exist(data.firstname) || !exist(data.lastname) || 
    !exist(data.dateNaissance) || !exist(data.civilite) || !exist(data.role)){
        return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
    }else{
        let isOnError = exist(data.portable) ? isValidLength(data.portable, 1, 30) ? false : true : false;
        if(isOnError || !emailFormat(data.email) || !passwordFormat(data.password) || !textFormat(data.firstname) || !textFormat(data.lastname) || !dateFormatFr(data.dateNaissance) || 
        (data.civilite.toLowerCase() !== "homme" && data.civilite.toLowerCase() !== "femme") || (data.role.toLowerCase() !== "administrateur" && data.role.toLowerCase() !== "commercial" && data.role.toLowerCase() !== "livreur" && data.role.toLowerCase() !== "client"  && data.role.toLowerCase() !== "prospect")){
            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
        }else{
            if(await UserModel.countDocuments({ email: data.email.trim().toLowerCase() }) !== 0){// Email already exist
                return dataResponse(res, 409, { error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré" });
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
                let user: UserInterface = new UserModel(toInsert);
                await user.save().then(async(user: UserInterface) => {
                    if(String(process.env.ENV).trim().toLowerCase() !== "test"){
                        await mailRegister(user.email, `${user.firstname} ${user.lastname}`);
                    } 
                    return dataResponse(res, 201, { error: false, message: "L'utilisateur a bien été créé avec succès" });
                }).catch(() => {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                });
            }
        }
    }
}

/**
 *  Route login user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const login = async (req: Request, res: Response): Promise<void> => {
    const data = req.body;
    if(isEmptyObject(data) || !exist(data.email) || !exist(data.password)){
        return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
    }else{
        if(!emailFormat(data.email) || !passwordFormat(data.password)){
            return dataResponse(res, 409, { error: true, message: 'Email/password incorrect' })
        }else{
            const user: UserInterface | null  = await UserModel.findOne({ email: data.email.trim().toLowerCase() }); //verification email
            if (user === null || user === undefined) {
                return dataResponse(res, 409, { error: true, message: "Email/password incorrect" });
            }else{
                //if(!user.checked) return dataResponse(res, 400, { error: true, message: "Votre email n'a pas été vérifié, consulter vos mails" });
                if(user.disabled){
                    return dataResponse(res, 400, { error: true, message: "Votre compte n'est pas actif" });
                }else{
                    if (await user.verifyPasswordSync(data.password)) {// Password correct
                        if (<number>user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                            return dataResponse(res, 429, { error: true, message: "Trop de tentative sur l'email " + data.Email + " (5 max) - Veuillez patienter (2mins)"});
                        }else{
                            user.token = jwt.sign({
                                id: user.get("_id"),
                                role: user.role,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60) * 24 * 7 , // 7 jours
                            }, String(process.env.JWT_TOKEN_SECRET)/*, { expiresIn: '1d'}*/);
                            user.attempt = 0;
                            user.updateAt = new Date();
                            user.lastLogin = new Date();
                            await user.save();
                            if(!user.checked){
                                let checkData = {
                                    fullName : `${user.firstname} ${user.lastname}`,
                                    email: user.email,
                                    url: 'http://' + req.headers.host + '/check/' + user.token
                                }//req.hostname
                                if(String(process.env.ENV).trim().toLowerCase() !== "test"){
                                    await mailCheckEmail(checkData);
                                } 
                            }
                            return dataResponse(res, 200, { error: false, message: "L'utilisateur a été authentifié avec succès", token: user.token})
                        }
                    }else{// Password incorrect
                        if(<number>user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                            return dataResponse(res, 429, { error: true, message: "Trop de tentative sur l'email " + data.email + " (5 max) - Veuillez patienter (2mins)"});
                        }else if(<number>user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) >= 2){
                            user.updateAt = new Date();
                            user.attempt = 1;
                            await user.save();
                            return dataResponse(res, 409, { error: true, message: 'Email/password incorrect'})
                        }else{
                            user.updateAt = new Date();
                            user.attempt = <number>user.attempt + 1;
                            await user.save();
                            return dataResponse(res, 409, { error: true, message: 'Email/password incorrect'})
                        }
                    }
                }
            }
        }
    }
}

/**
 *  Route delete user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteUser = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findOneAndDelete({ _id : payload.id });
            return dataResponse(res, 200, { error: false, message: 'L\'utilisateur a été supprimé avec succès' })// to transform to disabled user
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route recuperation user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getUser = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findOne({ _id: payload.id }, (err: Error, results: Response) => {
                if (err) {
                    return dataResponse(res, 500, {
                        error: true,
                        message: "Erreur dans la requête !"
                    });
                }else if (results === undefined || results === null){// Si le resultat n'existe pas
                    return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                } else {
                    if (results) {
                        return dataResponse(res, 200, {
                            error: false,
                            message: "Les informations ont bien été récupéré",
                            user: deleteMapper(results) 
                        });
                    } else {
                        return dataResponse(res, 401, {
                            error: true,
                            message: "La requête en base de donnée n'a pas fonctionné"
                        });
                    }
                }
            });
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route recuperation des users
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllUsers = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            let data = req.body;
            if(isEmptyObject(data) || !exist(data.role)){
                return dataResponse(res, 400, { error: true, message: 'Le role de l\'utilisateur est manquant' })
            }else{
                if(data.role.trim().toLowerCase() !== 'administrateur' && data.role.trim().toLowerCase() !== 'commercial' 
                && data.role.trim().toLowerCase() !== 'livreur' && data.role.trim().toLowerCase() !== 'client' && data.role.trim().toLowerCase() !== 'prospect'){
                    return dataResponse(res, 409, { error: true, message: 'Le role de l\'utilisateur n\'est pas conforme' })
                }else{
                    const roleFind = data.role.trim().charAt(0).toUpperCase() + data.role.trim().substring(1).toLowerCase();
                    await UserModel.find({ role: roleFind }, (err: Error, results: any) => {
                        if (err) {
                            return dataResponse(res, 500, {
                                error: true,
                                message: "Erreur dans la requête !"
                            });
                        }else if (results === undefined || results === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        } else {
                            if (results) {
                                return dataResponse(res, 200, {
                                    error: false,
                                    message: "Les " + data.role.trim().toLowerCase().concat('s') + " ont bien été récupéré",
                                    users: results.map((item: UserInterface) => deleteMapper(item))
                                });
                            } else {
                                return dataResponse(res, 401, {
                                    error: true,
                                    message: "La requête en base de donnée n'a pas fonctionné"
                                });
                            }
                        }
                    });
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route update user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateUser = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            if(isEmptyObject(data)) return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes'})
            const user: UserInterface | null = await UserModel.findById(payload.id);
            if(user === null || user === undefined){
                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !"})
            }else{
                let isOnError: boolean = false;
                isOnError = exist(data.portable) ? isValidLength(data.portable, 1, 30) ? false : true : false;
                let toUpdate = {
                    firstname: exist(data.firstname) ? !textFormat(data.firstname) ? (isOnError = true) : data.firstname : user.firstname,
                    lastname: exist(data.lastname) ? !textFormat(data.lastname) ? (isOnError = true) : data.lastname : user.lastname,
                    civilite: exist(data.civilite) ? (data.civilite.toLowerCase() !== "homme" && data.civilite.toLowerCase() !== "femme") ? (isOnError = true) : data.civilite : user.civilite,
                    dateNaissance: exist(data.dateNaissance) ? !dateFormatFr(data.dateNaissance) ? (isOnError = true) : data.dateNaissance : user.dateNaissance,
                    portable: exist(data.portable) ? data.portable : user.portable
                }
                if(isOnError){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                }else{
                    await UserModel.findByIdAndUpdate(payload.id, toUpdate, null, (err: Error, resp: any) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                        } else {
                            return dataResponse(res, 200, { error: false, message: "L'utilisateur a bien été mise à jour" })
                        }
                    });
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route disable user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const disableUser = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findByIdAndUpdate(payload.id, { disabled: true }, null, async(err: Error, resp: any) => {
                if (err) {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                } else {
                    const user: UserInterface | null  = await UserModel.findById(payload.id)//<UserInterface>
                    if(user === null || user === undefined){
                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !"})
                    }else{
                        return dataResponse(res, 200, { error: false, message: "L'utilisateur a bien été désactivé", disabled: user.disabled })
                    }
                }
            });
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route reinitiallisation password
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const forgotPassword = async (req: Request, res: Response) : Promise <void> => {
    const data = req.body;
    if(isEmptyObject(data) || !exist(data.email)){
        return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
    }else{
        if(!emailFormat(data.email)){
            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
        }else{
            if(await UserModel.countDocuments({ email: data.email.trim().toLowerCase() }) === 0){
                return dataResponse(res, 409, { error: true, message: "Votre email n'existe pas"}) 
            }else{
                //const passwordTemp = Math.random().toString(36).slice(-8);
                const passwordTemp = randChars(10).concat('*') + randomNumber(1,100) + '!';
                await UserModel.findOneAndUpdate({ email: data.email.trim().toLowerCase() }, { password: passwordTemp }, null, async(err: Error, resp: any) => {
                    if (err) {
                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                    } else {
                        if(String(process.env.ENV).trim().toLowerCase() !== "test"){
                            await mailforgotPw(data.email.trim().toLowerCase(), passwordTemp);
                        } 
                        return dataResponse(res, 200, { error: false, message: "Votre mot de passe a bien été réinitialisé, veuillez consulter votre boîte mail" })
                    }
                });
            }
        }   
    }
}

/**
 *  Route check de l'email
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const checkEmail = async (req: Request, res: Response) : Promise <void> => {
    const token = `Bearer ${req.params.token}`;
    await getJwtPayload(token).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findOneAndUpdate({ _id: payload.id }, { checked: true }, null, async(err: Error, resp: any) => {
                if (err) {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                } else {
                    return dataResponse(res, 200, { error: false, message: "L'email a bien été confirmé"})
                }
            });
        }
    }).catch((error) => {
        throw error;
    });
}
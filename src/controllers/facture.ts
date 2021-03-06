import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, dateHourMinuFormatEn, deleteMapper, emailFormat, exist, existTab, firstLetterMaj, getCurrentDate, getCurrentDateNextMonth, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, payloadTokenInterface, randomDateInterval, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import { CallbackError, FilterQuery, Schema } from 'mongoose';
import CommandeModel from '../models/CommandeModel';
import { mailInvoice } from '../middlewares/sendMail';
import { generateInvoice, getInvoiceData } from '../middlewares/invoice';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';
import PanierModel from '../models/PanierModel';
import ProductModel from '../models/ProductModel';
import ProductSelectedModel from '../models/ProductSelectedModel';
import UserModel from '../models/UserModel';
import CommandeInterface from '../interfaces/CommandeInterface';
import archiver from 'archiver';
import { cleanTempFolder, getFiles } from '../middlewares/generate';
import path from 'path';
import mime from 'mime';
import AdmZip from 'adm-zip';
import { setupCommande, setupDownload } from './commande';
import { getCoordByAdress } from './map';

/**
 *  Route envoie devis par mail
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const generateDevisMail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.setTimeout(0);
    await getJwtPayload(req.headers.authorization).then(async (payload: payloadTokenInterface | null) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            if(payload.role !== "Administrateur" && payload.role !== "Commercial") return dataResponse(res, 401, { error: true, message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette action' });
            const data = req.body;  
            const socket = req.app.get('socketIo')
            if(!existTab(data.devis)) return dataResponse(res, 400, { error: true, message: 'Aucun devis n\'est sélectionné' })
            if(!tabFormat(data.devis) || data.devis.length === 0) return dataResponse(res, 409, { error: true, message: 'Les devis ne sont pas au bon format'})    
            if(data.optionsDoc.isAdminCommercial){
                if(existTab(data.optionsDoc.emailAdminCommercial) && tabFormat(data.optionsDoc.emailAdminCommercial)){
                    for(let i = 0; i < data.optionsDoc.emailAdminCommercial.length; i++){
                        if(!emailFormat(data.optionsDoc.emailAdminCommercial[i])) return dataResponse(res, 409, { error: true, message: 'La sélection d\'email n\'est pas au bon format' })
                    }
                }else{
                    return dataResponse(res, 409, { error: true, message: "La sélection d'email n'existe pas" })
                }
            }
            if(data.optionsDoc.isUser){
                if(!exist(data.optionsDoc.emailUser)) return dataResponse(res, 409, { error: true, message: 'L\'email du destinataire suplémentaire est vide' })
                if(!emailFormat(data.optionsDoc.emailUser)) return dataResponse(res, 409, { error: true, message: 'L\'email du destinataire suplémentaire n\'est pas au bon format' })
            }     
            const folderName: string = uuidv4();// dossier pour les devis
            if(!fs.existsSync(`./tmpInvoice/`)) fs.mkdirSync(`./tmpInvoice/`)
            if(!fs.existsSync(`./tmpInvoice/${folderName}/`)) fs.mkdirSync(`./tmpInvoice/${folderName}/`)
            console.log('start')
            let counter = 0;
            for await (const devis of data.devis) {
                socket.emit('traitementStatut', true)
                if(!exist(devis.prospectID)){
                    return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
                }else{
                    if(!isObjectIdValid(devis.prospectID) || await UserModel.countDocuments({ _id: devis.prospectID }) === 0){
                        return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                    }else{
                        if(!existTab(devis.articles)) return dataResponse(res, 400, { error: true, message: 'Aucun article n\'est sélectionné' })
                        if(!tabFormat(devis.articles)) return dataResponse(res, 409, { error: true, message: 'Les articles ne sont pas au bon format'})
                        for await (const article of devis.articles) {
                            if(!exist(article.idProduct) || !exist(article.matiere) || !exist(article.couleur) || !exist(String(article.quantite)) || !existTab(article.listeComposantsSelected)){
                                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
                            }else{
                                if((!isObjectIdValid(article.idProduct) || await ProductModel.countDocuments({ _id: article.idProduct}) === 0) || 
                                !textFormat(article.matiere) || !textFormat(article.couleur) || !numberFormat(String(article.quantite)) || !tabFormat(article.listeComposantsSelected)){
                                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                                }else{
                                    let isComposantErrorExist: boolean = false;
                                    let isComposantErrorInvalide: boolean = false;
                                    if(article.listeComposantsSelected.length > 0){
                                        const composantsData : string[] = []
                                        article.listeComposantsSelected.forEach(async(el: any) => {
                                            composantsData.push(el.idComposant)
                                            if(!exist(el.idComposant) || !exist(el.matiere) || !exist(el.couleur) || !exist(String(el.quantite))){
                                                isComposantErrorExist = true;
                                            }else{
                                                if(!isObjectIdValid(el.idComposant) || !textFormat(el.matiere) || !numberFormat(String(el.quantite)) || !textFormat(el.couleur)){
                                                    isComposantErrorInvalide = true;
                                                }
                                            }
                                        });
                                        isComposantErrorInvalide = await ProductModel.countDocuments({ $and: [{ '_id': article.idProduct }, { 'composants': { $all: composantsData } }] } ) !== 1 ? true : isComposantErrorInvalide
                                    }
                                    if(isComposantErrorExist){
                                        return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
                                    }else if(isComposantErrorInvalide){
                                        return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                                    }else{
                                        const toInsert = {
                                            "refID": uuidv4(),
                                            "idProduct": article.idProduct,
                                            "matiere": article.matiere,
                                            "couleur": article.couleur,
                                            "quantite": article.quantite,
                                            "listeComposantsSelected": article.listeComposantsSelected,
                                            "isCommande": false
                                        };                                   
                                        let productSelected: ProduitSelectedInterface = new ProductSelectedModel(toInsert);
                                        const productSelectedSaved: ProduitSelectedInterface = await productSelected.save();
                                        const user: any = await UserModel.findOne({ _id: devis.prospectID }).populate('idPanier');
                                        if (user) {
                                            const panier: Array<ProduitSelectedInterface> = user.idPanier.articles;
                                            panier.push(productSelectedSaved.get('_id'))
                                            await PanierModel.findByIdAndUpdate(user.idPanier, { articles: panier }); 
                                        }
                                    }
                                }
                            }
                        }
                        const userInfos: any = await UserModel.findOne({ _id: devis.prospectID }).populate('idEntreprise').populate('idPanier');
                        const articles: any = await ProductSelectedModel.find({ '_id': { $in: userInfos.idPanier.articles }}).populate('idProduct').populate('listeComposantsSelected.idComposant');
                        if (articles) {
                            let prixTotal: number = 0;
                            articles.forEach((article: any) => {
                                prixTotal = prixTotal + parseInt(article.quantite) * parseFloat(article.idProduct.prix);
                                article.listeComposantsSelected.forEach((composant: any) => {
                                    prixTotal = prixTotal + (parseInt(article.quantite) * (parseInt(composant.quantite) * parseFloat(composant.idComposant.prix)));
                                });
                            });
                            prixTotal = prixTotal + 10 + (prixTotal * 0.05) //Frais de livraison de 10 € + 5% du total (taxe/impôt)
                            const homeAdress: string = "70 Rue Marius Aufan, 92300 Levallois-Perret"
                            const coordinateData: any = await getCoordByAdress(homeAdress);
                            const commandeToInsert = {
                                "refID": uuidv4(),
                                "clientID": devis.prospectID,
                                "livreurID": null,
                                "dateLivraison": getCurrentDate(randomDateInterval(new Date(), new Date(new Date().getFullYear() + '-12-31T23:59:59'))), // YYYY-MM-DD hh:mm getCurrentDateNextMonth()
                                "adresseLivraison": homeAdress,
                                "statut": "Attente",
                                "articles": articles,
                                "prixTotal": prixTotal.toFixed(2),
                                "coordinate" : {
                                    "latitude": coordinateData.features.length > 0 ? coordinateData.features[0].geometry.coordinates[1] : 0,
                                    "longitude": coordinateData.features.length > 0 ? coordinateData.features[0].geometry.coordinates[0] : 0
                                }
                            }
                            const commande: CommandeInterface = new CommandeModel(commandeToInsert);
                            const commandeSaved: CommandeInterface = await commande.save();
                            await setupCommande(res, data, commandeSaved.get('_id'), userInfos, folderName, true, true);
                        }
                    }
                }
                counter++
                socket.emit('traitement', data.devis.length, counter)
                console.log('ok')
            }
            socket.emit('traitement', data.devis.length, 0)
            console.log('end')
            if(data.optionsDoc.isDownload){
                const destPath: string = await setupDownload(folderName);
                res.set({
                    'Content-disposition': 'attachment; filename=' + path.basename(`./tempDownload/${destPath}`),
                    'Content-type': mime.lookup(`./tempDownload/${destPath}`),
                    'Content-Length': fs.statSync(`./tempDownload/${destPath}`).size
                })
                const fileStream: fs.ReadStream = fs.createReadStream(`./tempDownload/${destPath}`);
                fileStream.on('data', (dataChunk) => { 
                    console.log(`Received ${dataChunk.length} bytes of data.`) 
                });
                fileStream.pipe(res);
                fileStream.on('end', () => {
                    socket.emit('traitementStatut', false)
                    setTimeout(() => {
                        if(fs.existsSync(path.join('./tmpInvoice/' + folderName + '/'))) cleanOneFileFolder(`./tmpInvoice/${folderName}`)
                        if(fs.existsSync(path.join('./tempDownload/' + destPath + '/'))) cleanOneFileFolder(`./tempDownload/${destPath}`)
                    }, 5000);
                });
                fileStream.on('error', (err) => {
                    throw err;
                });
            }else{
                if(fs.existsSync('./tmpInvoice/' + folderName)) fs.rmdirSync('./tmpInvoice/' + folderName, { recursive: true })
                socket.emit('traitementStatut', false)
                return dataResponse(res, 201, { error: false, message: data.devis.length === 1 ? "Le devis a bien été envoyé par mail" : "Les devis ont bien été envoyé par mail" });  
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Download file/zip
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const download = async (req: Request, res: Response): Promise<void> => {
    const destPath = req.params.destPath;
    const filePath = path.join('./tempDownload/' + destPath);
    if(!fs.existsSync(filePath) || !exist(filePath)){
        return dataResponse(res, 404, { error: true, message: 'Le fichier n\'existe plus' })
    }else{
        res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(filePath));
        res.setHeader('Content-type', mime.lookup(filePath));
        res.setHeader('Content-Length', fs.statSync(filePath).size);
        const filestream: fs.ReadStream = fs.createReadStream(filePath);
        filestream.pipe(res);
        filestream.on('end', () => {
            //res.download(filePath); // Set disposition and send it.
            cleanOneFileFolder(filePath)        
        });
    }
}

export const cleanFolder = (path: string) => {
    fs.readdirSync(path).forEach((el: string) => {
        if(fs.lstatSync(path).isFile()){
            fs.unlinkSync(path + el)
        }else{
            fs.rmdirSync(path + el, { recursive: true })
        }
    });
}

export const cleanOneFileFolder = (path: string) => {
    if(fs.lstatSync(path).isFile()){
        fs.unlinkSync(path)
    } else{
        fs.rmdirSync(path, { recursive: true })
    }
}
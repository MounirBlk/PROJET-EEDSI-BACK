import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, dateHourMinuFormatEn, deleteMapper, emailFormat, exist, existTab, firstLetterMaj, getCurrentDate, getCurrentDateNextMonth, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, payloadTokenInterface, randomDateInterval, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import { CallbackError, FilterQuery, Schema } from 'mongoose';
import path from 'path';
import mime from 'mime';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios"
import CommandeModel from '../models/CommandeModel';
import { shuffle } from 'lodash';

/**
 *  Route recupération coordonnée d'une adresse
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getCoordinate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload: payloadTokenInterface | null) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            if(payload.role !== "Administrateur" && payload.role !== "Commercial") return dataResponse(res, 401, { error: true, message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette action' });
            const data = req.body;
            if(isEmptyObject(data) || !exist(data.adresse)){
                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
            }else{
                if(!isValidLength(data.adresse, 1, 100)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                }else{
                    //await setAdressesData();
                    getCoordByAdress(data.adresse).then((response) => {
                        return dataResponse(res, 200, { error: false, message: "OK", data: response })
                    }).catch((error: any) => {
                        console.log(error)
                        throw error;
                    })
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 * get coordonnée lat / long by adress
 */
export const getCoordByAdress = async(adresse: string) => {
    return new Promise((resolve, reject) => {
        axios(getConfigAxios(`https://api-adresse.data.gouv.fr/search/?q=${adresse.replace(/ /g, '+')}`,'get'))//https://randommer.io/random-address
            .then(({ data: response } : AxiosResponse) => {//CIRCULAR JSON (RETURN response)
                if(response !== undefined && response !== null){
                    resolve(response)
                }
        }).catch((error: any) => {
            console.log(error)
            reject(error);
        })
    });
}

/**
 *  Request config 
 *  @param url url
 *  @param methodReq post / get / put / delete ...
 *  @param dataBody? data from body
 */ 
const getConfigAxios = (url: string, methodReq: Method, dataBody: any = null) => {
    const configAxios: AxiosRequestConfig  = {
        url: url.trim(),
        method: methodReq,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        data: dataBody
    };
    dataBody === null ? delete configAxios.data : null;
    return configAxios;
}

const readFileByLines = (urlFile: string): string[] => {
    const data: string = fs.readFileSync(urlFile, 'utf-8');
    const lines: string[] = data.split(/\r?\n/);    // split the contents by new line
    return lines as string[]
}

const setAdressesData = async(): Promise<void> => {
    const adresses: string[] = shuffle(readFileByLines(process.cwd() + '/autres/adresses.txt'));
    //await CommandeModel.updateMany({ coordinate: { latitude: 0, longitude: 0 }})
    const commandes = await CommandeModel.find({ coordinate: { latitude: 0, longitude: 0 }})
    let i = 0;
    for await (const item of commandes) {
        let resp: AxiosResponse = await axios(getConfigAxios(`https://api-adresse.data.gouv.fr/search/?q=${adresses[i].replace(/ /g, '+')}`, 'get'));
        if(resp.data.features.length !== 0){
            await CommandeModel.findByIdAndUpdate(item._id, { adresseLivraison: adresses[i], coordinate: { latitude: resp.data.features[0].geometry.coordinates[1], longitude: resp.data.features[0].geometry.coordinates[0]} })
        }
        i++
    }
}
import { Application, Request, Response, NextFunction, Errback } from 'express';
//import { random } from "lodash";

/**
 * Function qui fait un retour d'une donnée
 * @param {Response} res 
 * @param {Number} status 
 * @param {Object} data 
 */
const dataResponse = (res: Response, status: number = 500, data: any = { error: true, message: "Processing error" }) => {
    res.setHeader("Content-Type", "application/json");
    try {
        res.status(status).json(data);
    } catch (error) {
        //Cette erreur ne DOIT jamais apparaitre
        let sendError = { error: true, message: "Processing error" };
        res.status(500).json(sendError);
    }
}

/**
 *  Function qui supprime les données return inutile
 *  @param {Object} data Data
 *  @param {string} mapperNameRoute? Nom de la route
 */ 
const deleteMapper = (data: any, mapperNameRoute?: string): any => {
    //delete data._id;
    return data;
}

/**
 *  Function qui vérifie l'existence d'une data
 */ 
const exist = (data: string): Boolean => {
    if (data == undefined || data.trim().length == 0 || data == null)
        return false
    else
        return true
}

/**
 *  Function qui vérifie l'existence de toutes les datas d'un objet (INUTILISABLE)
 */ 
const existObject = (objectData: any): boolean => {
    let isValid = true;
    for(let o in objectData){
        if(!exist(o)) isValid = false;
    }
    return isValid;
}

/**
 *  Function vérification de si la date est dans le bon format à l'envoi (FR)
 */ 
const dateFormatFr = (data: string): Boolean => {
    let regexDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
    if (data.match(regexDate) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si la date est dans le bon format à l'envoi (US)
 */ 
const dateFormatEn = (data: string): Boolean => {
    let regexDate = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/
    if (data.match(regexDate) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si l'email est dans le bon format
 */ 
const emailFormat = (data: string): Boolean => {
    //let regexEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (data.match(regexEmail) == null)
        return false
    else
        return true
}

/**
 *  Function vérification password (taille entre 7 et 20 caracteres)
 */ 
const passwordFormat = (data: string): Boolean => {
    //let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{7,})/; //maj mini chiffre taille7
    //let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; //maj mini specialchar chiffre taille8 mini
    let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^-])[A-Za-z\d@$!%*?&#^-]{7,20}$/; //maj mini specialchar chiffre taille7_mini taille20_max
    return (data.match(regexPassword) == null || data === undefined /*|| !isValidLength(data, 7, 20)*/) ? false : true
}

/**
 *  Function vérification de si le zip est dans le bon format
 */ 
const zipFormat = (data: string): Boolean => {
    let regexZip = /^(([0-8][0-9])|(9[0-5]))[0-9]{3}$/
    if (data.match(regexZip) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si le text est dans le bon format (taille entre 2 et 25 caracteres)
 */ 
const textFormat = (data: string): Boolean => {
    let regexText = /^[^@"()/!_$*€£`+=;?#]+$/ // regex:  /^[^@&"()!_$*€£`+=\/;?#]+$/
    if (data.match(regexText) == null)
        return false
    else
        return isValidLength(data, 2, 25) ? true : false
    
}

/**
 *  Function vérification de si la date est dans le format number
 */ 
const numberFormat = (data: string): Boolean => {
    let regexNumber = /^[0-9]+$/
    if (data.match(regexNumber) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si la date est dans le format float
 */ 
const floatFormat = (data: string): Boolean => {
    let regexFloat = /^[0-9]+(\.[0-9]{0,})$/
    if (data.match(regexFloat) == null)
        return false
    else
        return true
}

/**
 *  Function vérification si le mdp possede 6 caracteres min
 */ 
const isValidPasswordLength = (password: string): boolean => {
    return password.length >= 6 ? true : false;
}

/**
 *  Function change le nom de la cle d'un objet
 */
const renameKey = (object: any, key: any, newKey: any) => {
    const clonedObj = clone(object);
    const targetKey = clonedObj[key];
    delete clonedObj[key];
    clonedObj[newKey] = targetKey;
    return clonedObj;
};

/**
 * Clone pour le rename de la key
 */
const clone = (obj: any) => Object.assign({}, obj);

/**
 *  Function vérification de la taille min et max d'une variable
 */ 
const isValidLength = (text: string, min: number, max: number): boolean => {
    return text.length >= min && text.length <= max ? true : false;
}

/**
 *  Function convertis une chaine de caracteres en binaire
 */ 
const textToBinary = (idString: any) => {
    let result = "";
    for (let i = 0; i < idString.length; i++) {
        let bin = idString[i].charCodeAt().toString(2);
        result += Array(8 - bin.length + 1).join("0") + bin;
    } 
    return result;
}

/**
 *  Function convertis du binaire en chaine de caracteres
 */ 
const binaryToText = (idBinary: any) => {
    let idString = idBinary.split(' ') //Split string in array of binary chars
    .map((bin: any) => String.fromCharCode(parseInt(bin, 2))) //Map every binary char to real char
    .join(''); //Join the array back to a string
    return idString;
}

/**
 *  Function qui return la date du jour à la seconde près aaaa/mm/jj hh:mm:ss
 */ 
const getCurrentDate = (dt: Date = new Date()) => {
    return `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`   
}

/**
 *  Function qui return time en hh:mm:ss
 */ 
const getTimeHourSecMin = (dt: Date = new Date()) => {
    return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`   
}

/**
 *  Function random float min et max
 */ 
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 *  Function convert ht en ttc
 */ 
const calculHtToTtc = (montant_ht: number , tauxTva: number ) => {
    let montant_tva = montant_ht * tauxTva
    let montant_ttc = montant_ht + montant_tva;
    return montant_ttc;
}

/**
 *  Function convert ttc en ht
 */ 
const calculTtcToHt = (montant_ttc: number , tauxTva: number) => {
    return montant_ttc / (1 + tauxTva)
}


/**
 * Function verfication la conformiter de la date de la carte
 *  @param {Object} data data
 */
const isValidDateCard = (data: any): boolean => {
    let today = new Date;
    let year = today.getFullYear().toString().substr(-2);
    let month = String(today.getMonth()+1);
    month = parseInt(month) > 0 && parseInt(month) < 10 ? '0'.concat(String(parseInt(month))) : month
    let verifYear: boolean = data.year > year ? true : false
    let isValidDate: boolean = data.year === year ? parseInt(data.month) >= parseInt(month) ? true : false : verifYear;
    return isValidDate;
}
/**
 *  Random name file 
 */ 
const randFileName = (): string => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var minSecMili = today.getMinutes() + '' + today.getSeconds() + '' + today.getMilliseconds()
    return dd + '-' + mm + '-' + yyyy + '_' + minSecMili;
}

/**
 *  Random char 
 *  @param {number} length? 
 */ 
const randChars = (length: number = 10): string => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export { dataResponse, existObject, renameKey, randFileName, randChars, getCurrentDate, getTimeHourSecMin, calculHtToTtc, calculTtcToHt, randomFloat, textToBinary, binaryToText, isValidLength, isValidPasswordLength, deleteMapper, exist, dateFormatFr, dateFormatEn, emailFormat, passwordFormat, zipFormat, textFormat, numberFormat, floatFormat, isValidDateCard};


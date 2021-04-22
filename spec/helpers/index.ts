
import fs from 'fs';

/**
 *  Random name file 
 */ 
export const randomFileName = (): string => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var minSecMili = today.getMinutes() + '' + today.getSeconds() + '' + today.getMilliseconds()
    return dd + '.' + mm + '.' + yyyy + '.' + minSecMili;
}
/**
 *  Function qui return la date du jour à la seconde près aaaa/mm/jj hh:mm
 */ 
export const getDateHHmm = (dt: Date = new Date()) => {
    //:${dt.getSeconds().toString().padStart(2, '0')}
    return `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
}

/**
 *  get timeout request (default: 60 sec)
 *  @param {number} secondes ? 
 */ 
export const getTimeout = (secondes: number = 60): number => {
    return secondes * 1000;
}

/**
 *  Function qui vérifie l'existence d'une data
 */ 
export const exist = (data: string): Boolean => {
    if (data == undefined || data.trim().length == 0 || data == null)
        return false
    else
        return true
}

/**
 *  Random number between min and max
 *  @param {number} min  
 *  @param {number} max  
 */ 
export const randNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 *  Random char (default taille 10)
 *  @param {number} length ? 
 */ 
export const randomChars = (length: number = 10): string => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result.trim().charAt(0).toUpperCase() + result.trim().substring(1).toLowerCase();// 1 lettre maj mini
}

/**
 *  générator random Date FR
 *  @param {Date} start début année (1950)
 *  @param {Date} end fin année (today)
 */ 
export const randomDateFr = (start: Date = new Date(1950, 0, 1), end: Date = new Date()): string => {
    let dt = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));//FORMAT DATE
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth()+1).toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')}`   
}

/**
 *  générator random Date EN
 *  @param {Date} start début année (1950)
 *  @param {Date} end fin année (today)
 */ 
export const randomDateEn = (start: Date = new Date(1950, 0, 1), end: Date = new Date()): string => {
    let dt = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));//FORMAT DATE
    return `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`   

}

/**
 *  Conversion to form body 
 *  @param {Object} data 
 */ 
export const convertToFormBody = (data: any) => {
    let formBody: any = [];
    for (let property in data) {
        //cardDetails.hasOwnProperty(property)
        formBody.push(encodeURIComponent(property) + '=' + encodeURIComponent(data[property]));
    }
    return formBody.join("&");
}

/**
 *  Conversion to UrlEncoded
 *  @param {Object} data 
 */ 
export const toUrlEncoded = (obj: any) => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

/**
 *  Conversion to form data
 *  @param {Object} data 
 */ 
export const getFormData = (object: any) => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}

/**
 *  Function random float min et max
 */ 
export const randFloat = (min: number, max: number): number => { 
    return Math.random() * (max - min) + min 
};
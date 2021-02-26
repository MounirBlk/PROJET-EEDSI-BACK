
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
 *  get timeout request (default: 60 sec)
 *  @param {number} secondes ? 
 */ 
export const getTimeout = (secondes: number = 60): number => {
    return secondes * 1000;
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
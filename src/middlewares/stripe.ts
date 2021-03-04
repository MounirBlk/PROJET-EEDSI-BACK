import UserInterface from "../interfaces/UserInterface";
import { isValidLength, numberFormat } from "./index";
const axios = require('axios').default;

/**
 *  Add card token stripe
 */ 
export const addCardStripe = async(numberCard: number, exp_month: number, exp_year: number, cvc?: number) : Promise<any> => {
    return new Promise(async(resolve, reject) => {
        let payload: any = {
            "card[number]": String(numberCard),
            "card[exp_month]": String(exp_month),
            "card[exp_year]": String(exp_year),
            //"card[cvc]": String(cvc),//optional
        };
        const dataBody = convertToFormBody(payload);
        await axios(`https://api.stripe.com/v1/tokens`, getConfigaxios('post', dataBody))
            .then((data: any) => {
                resolve(data.data)// return tok_...
            }).catch((error: any) => {
                resolve(error.response)
            })
    });
}

/**
 *  Add customer stripe
 */ 
export const addCustomerStripe = async(email: string, fullName: string) => {
    let payload: any = {
        "email": email,
        "name": fullName,
    };
    const dataBody = convertToFormBody(payload);
    return await axios("https://api.stripe.com/v1/customers", getConfigaxios('post', dataBody))// return cus_...
}

/**
 *  Update customer with card token (secure) stripe
 */ 
export const updateCustomerCardStripe = async(idCustomer: string | undefined , idCard: string) => {
    if(idCustomer === undefined || idCustomer === null) return;
    let payload: any = {
        'source' : idCard
    };
    const dataBody = convertToFormBody(payload);
    return await axios(`https://api.stripe.com/v1/customers/${idCustomer}/sources`, getConfigaxios('post', dataBody))// return src_...
}

/**
 *  Ajout du produit stripe
 */ 
export const addProductStripe = async(name: string, description: string, unitAmount: number = 500, currency: string = 'eur') => {
    let payload: any = {
        name: name,
        description: description
    };
    const dataBody = convertToFormBody(payload);
    const responseAddProduct = await axios(`https://api.stripe.com/v1/products`, getConfigaxios('post', dataBody))
    return await addPriceProductStripe(responseAddProduct.data.id, unitAmount, currency);
}

/**
 *  Ajout du price sur un produit
 */ 
const addPriceProductStripe = async(idProduct: string, unitAmount: number = 500, currency: string = 'eur') => {
    let payload: any = {
        "product": idProduct,
        "currency": currency.toLowerCase(),
        "unit_amount": unitAmount < 0 ? 500 : unitAmount,// equivalent a 500 centimes soit 5.00 Euros
        "billing_scheme": "per_unit",
        "recurring[interval]":"month",
        "recurring[interval_count]":"1",
        "recurring[trial_period_days]":"0",
        "recurring[usage_type]":"licensed"
        //"unit_amount_decimal": unitAmount < 0 ? String(500) : String(unitAmount),
    };
    const dataBody = convertToFormBody(payload);
    return await axios(`https://api.stripe.com/v1/prices`, getConfigaxios('post', dataBody))
}

/**
 *  Payment abonnement au produit
 */ 
export const paymentStripe = async(idCustomer: string | undefined, idPrice: string, quantity: number = 1): Promise<any>=> {
    return new Promise(async(resolve, reject) => {
        if(idCustomer === null || idCustomer === undefined){
            reject();
        }else{
            let payload: any = {
                "customer": idCustomer,
                "off_session": String(true),
                "collection_method": "charge_automatically",
                "items[0][price]": idPrice,
                "items[0][quantity]": String(quantity),
                "enable_incomplete_payments": String(false) // Champ a vérifier et confirmer
            };
            const dataBody = convertToFormBody(payload);
            await axios(`https://api.stripe.com/v1/subscriptions`, getConfigaxios('post', dataBody))
                .then((data: any) => {
                    resolve(data)//return sub_...
                }).catch((error: any) => {
                    reject(error)
                })
        }        
    });
}

/**
 *  Récupération des données du client Stripe
 */ 
export const getCustomerStripe = async(idCustomer: string) => {
    return await axios(`https://api.stripe.com/v1/customers/${idCustomer}`, getConfigaxios('get'))
}

/**
 *  Function get all cards from customer
 *  @param idCard idCard
 */ 
export const getAllCardsCustomerStripe = async(idCustomer: string | undefined) => {
    if(idCustomer === null || idCustomer === undefined) return { data: {} };
    return await axios(`https://api.stripe.com/v1/customers/${idCustomer}/sources?object=card`, getConfigaxios('get'))
}

/**
 *  Modifier les données clients Stripe
 */ 
export const updateCustomerStripe = async(idCustomer: string | undefined, data: any, user: UserInterface): Promise<any>=> {
    return new Promise(async(resolve, reject) => {
        if(idCustomer === null || idCustomer === undefined){
            reject();
        }else{
            let payload: any = { 
                "email": user.email,
                "name": data.firstname+' '+data.lastname,  
            };
            const dataBody = convertToFormBody(payload);
            await axios(`https://api.stripe.com/v1/customers/${idCustomer}`, getConfigaxios('post', dataBody))
                .then((data: any) => {
                    resolve(data)
                }).catch((error: any) => {
                    reject(error)
                })
        }
    });
}

/**
 *  Supprimer le clients Stripe
 */ 
export const deleteCustomerStripe = async(idCustomer: string | undefined): Promise<any>=> {
    return new Promise(async(resolve, reject) => {
        if(idCustomer === null || idCustomer === undefined){
            reject();
        }else{
            await axios(`https://api.stripe.com/v1/customers/${idCustomer}`, getConfigaxios('delete'))
                .then((response: any) => {
                    resolve(response)
                }).catch((error: any) => {
                    reject(error)
                })
        }
    });
}

/**
 *  Function get one card from customer
 *  @param idCustomer idCustomer
 *  @param idCard idCard
 */ 
export const getCardCustomerStripe = async(idCustomer: string, idCard: string) => {
    return await axios(`https://api.stripe.com/v1/customers/${idCustomer}/sources/${idCard}`, getConfigaxios('get'))
}

/**
 *  Function to detach a source card from customer
 *  @param idCustomer idCustomer
 *  @param idCard idCard
 */ 
export const detachCardCustomerStripe = async(idCustomer: string, idCard: string) => {
    return await axios(`https://api.stripe.com/v1/customers/${idCustomer}/sources/${idCard}`, getConfigaxios('delete'))
}


/**
 *  Check conformité sub card (true = fail et false = success)
 */ 
export const checkIsNonConformeSub = (data: any): boolean => {
    if(!isValidLength(data.cvc, 3, 3) || !isValidLength(data.id, 1, 10)){
        return true;//fail
    }else{
        const isNegative: boolean = parseInt(data.cvc) < 0 || parseInt(data.id) < 0 ? true : false;
        const isNotNumber: boolean = !numberFormat(data.id) || !numberFormat(data.cvc) ? true : false ;
        if(isNegative || isNotNumber){
            return true;//fail
        }else{
            return false;//success
        }
    }
}


/**
 *  Request config 
 *  @param methodReq post / get / put / delete ...
 *  @param dataBody? data from body
 */ 
const getConfigaxios = (methodReq: string, dataBody: any = null) => {
    const configaxios = {
        method: methodReq.trim().toLowerCase(),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 
        },
        data: dataBody
    };
    dataBody === null ? delete configaxios.data : null;
    return configaxios;
}

/**
 *  Conversion to form body
 */ 
const convertToFormBody = (data: any) => {
    let formBody: any = [];
    for (let property in data) {
        //cardDetails.hasOwnProperty(property)
        formBody.push(encodeURIComponent(property) + '=' + encodeURIComponent(data[property]));
    }
    return formBody.join("&");
}

/**
 *  Conversion to UrlEncoded
 */ 
const toUrlEncoded = (obj: any) => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

/**
 *  Conversion to form data
 */ 
const getFormData = (object: any) => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}
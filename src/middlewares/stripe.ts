import UserInterface from "../interfaces/UserInterface";
import { exist, isValidLength, numberFormat } from "./index";
import axios, { AxiosError, AxiosResponse, Method } from "axios"
import Stripe from 'stripe';

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
    apiVersion: '2020-08-27',
    maxNetworkRetries: 2,
});

/**
 *  Add card token stripe
 */ 
export const addCardStripe = async(numberCard: number, exp_month: number, exp_year: number, cvc: number | null = null) : Promise<Stripe.Response<Stripe.Token>> => {
    return new Promise(async(resolve, reject) => {
        let payload: any  = {
            card: {
                number: String(numberCard),
                exp_month: String(exp_month),
                exp_year: String(exp_year),
                cvc: String(cvc)
            }
        };
        exist(String(cvc)) === false ? (delete payload.card.cvc) : null;
        await stripe.tokens.create(payload).then((data: Stripe.Response<Stripe.Token>) => {
                resolve(data)// return tok_...
            }).catch((error: any) => {
                resolve(error.response)// verification de la carte
            })
    });
}

/**
 *  Add customer stripe
 */ 
export const addCustomerStripe = async(email: string, fullName: string): Promise<Stripe.Response<Stripe.Customer>> => {
    return new Promise(async(resolve, reject) => {
        let payload: Stripe.CustomerCreateParams | undefined = {
            "email": email,
            "name": fullName,
        };
        await stripe.customers.create(payload).then((data: Stripe.Response<Stripe.Customer>) => {
            resolve(data)// return data.cus_...
        }).catch((error: any) => {
            reject(error)
        })
    });
}

/**
 *  Update customer with card token (secure) stripe
 */ 
export const updateCustomerCardStripe = async(idCustomer: string | undefined , idCard: string): Promise<Stripe.Response<Stripe.CustomerSource>> => {
    return new Promise(async(resolve, reject) => {
        let payload: Stripe.CustomerSourceCreateParams = {
            'source' : idCard
        };
        await stripe.customers.createSource(String(idCustomer), payload).then((data: Stripe.Response<Stripe.CustomerSource>) => {
            resolve(data)// return data.src_...
        }).catch((error: any) => {
            reject(error)
        })
    });
}

/**
 *  Ajout du produit stripe
 */ 
export const addProductStripe = async(nom: string, description: string, unitAmount: number, isRecurrent: boolean, currency: string = 'eur', imgObj: any = null): Promise<any> => {
    return new Promise(async(resolve, reject) => {
        let payload: Stripe.ProductCreateParams = {
            name: nom,
            description: description,
        };
        let imgLink: string | null = null;
        if(imgObj !== null && imgObj !== undefined){
            const fileData = await addFileStripe(imgObj);
            const urlFile = (await addImgProduct(fileData.id)).url;
            let imgTabLink: Array<string> = [];
            imgTabLink.push(urlFile)
            payload.images = imgTabLink;
            imgLink = urlFile;
        }
        await stripe.products.create(payload).then(async(respProduct: Stripe.Response<Stripe.Product>) => {//https://api.stripe.com/v1/products
            const idStripePrice = (await addPriceProductStripe(respProduct.id, unitAmount, isRecurrent, currency)).data.id;
            const toReturn = {
                idStripeProduct : respProduct.id,
                idStripePrice: idStripePrice,
                imgLink: imgLink
            }
            resolve(toReturn);
        }).catch((err: any) => {
            reject(err);
        })
    });
}

/**
 *  Ad file to stripe system
 */ 
const addFileStripe = async(imgObj: any): Promise<Stripe.Response<Stripe.File>> => {
    return new Promise(async(resolve, reject) => {
        //https://files.stripe.com/v1/files
        resolve(await stripe.files.create({
            file: {
                data: imgObj.imgFile,
                name: imgObj.imgName,
                type: 'application.octet-stream',
            },
            purpose: 'dispute_evidence',
        }));
    });
}

/**
 *  Ajout de l'image sur product dashboard
 */ 
const addImgProduct = async(idFile: string): Promise<any> => {
    return new Promise(async(resolve, reject) => {
        let payload: any = {
            "file": idFile,
        };
        const dataBody = convertToFormBody(payload);
        await axios(getConfigAxios(`https://api.stripe.com/v1/file_links`, 'post', dataBody)).then(async(resp: AxiosResponse) => {
            resolve(resp.data);
        }).catch((err: AxiosError) => {
            reject(err);
        })
    });
}

/**
 *  Get list of files
 */ 
const getListFiles = async(): Promise<AxiosResponse> => {
    return new Promise(async(resolve, reject) => {
        await axios(getConfigAxios(`https://api.stripe.com/v1/files`, 'get')).then(async(resp: AxiosResponse) => {
            resolve(resp.data.data);
        }).catch((err: AxiosError) => {
            reject(err);
        })
    });
}

/**
 *  Update product stripe
 */ 
export const updateProductStripe = async(idProduct: string, name: string, description: string, isArchive: boolean, imgObj: any = null): Promise<any> => {
    return new Promise(async(resolve, reject) => {
        let payload: Stripe.ProductUpdateParams = {
            name: name,
            description: description
        };
        let imgLink: string | null = null;
        if(isArchive){//archivé
            payload.active = false
        }else{
            if(imgObj !== null && imgObj !== undefined){
                const fileData = await addFileStripe(imgObj);
                const urlFile = (await addImgProduct(fileData.id)).url;
                let imgTabLink: Array<string> = [];
                imgTabLink.push(urlFile)
                payload.images = imgTabLink;
                imgLink = urlFile;
            }
        }
        await stripe.products.update(idProduct, payload).then(async(resp: Stripe.Response<Stripe.Product>) => {
            const toReturn = {
                imgLink: imgLink
            }
            resolve(toReturn);
        }).catch((err: any) => {
            reject(err);
        })
    });
}

/**
 *  Ajout du price sur un produit
 */ 
const addPriceProductStripe = async(idProduct: string, unitAmount: number, isRecurrent: boolean, currency: string = 'eur'): Promise<AxiosResponse> => {
    return new Promise(async(resolve, reject) => {
        let payload: any = {
            "product": idProduct,
            "currency": currency.toLowerCase(),
            "unit_amount": unitAmount < 0 ? 0 : (unitAmount * 100),// en centimes (unit_amount_decimal ?)
            "billing_scheme": "per_unit",
        };
        if(isRecurrent){
            payload['recurring[interval]'] = "month";
            payload['recurring[interval_count]'] = "1";
            payload['recurring[trial_period_days]'] = "0";
            payload['recurring[usage_type]'] = "licensed";
        }         
        const dataBody = convertToFormBody(payload);
        await axios(getConfigAxios(`https://api.stripe.com/v1/prices`, 'post', dataBody)).then((resp: AxiosResponse) => {
            resolve(resp)
        }).catch((err: AxiosError) => {
            reject(err);
        })
    });
}

/**
 *  Update price stripe
 */ 
export const updatePriceStripe = async(idPrice: string, isArchive: boolean): Promise<AxiosResponse> => {
    return new Promise(async(resolve, reject) => {
        let payload: any = {}
        if(isArchive){//archivé
            payload.active = false;
        }
        const dataBody = convertToFormBody(payload);
        await axios(getConfigAxios(`https://api.stripe.com/v1/prices/${idPrice}`, 'post', dataBody)).then(async(resp: AxiosResponse) => {
            resolve(resp);
        }).catch((err: AxiosError) => {
            reject(err);
        })
    });
}

/**
 *  Delete product stripe
 */ 
export const deleteProductStripe = async(idProduct: string): Promise<AxiosResponse> => {
    return new Promise(async(resolve, reject) => {
        await axios(getConfigAxios(`https://api.stripe.com/v1/products/${idProduct}`, 'delete')).then(async(resp: AxiosResponse) => {
            resolve(resp);
        }).catch((err: AxiosError) => {
            reject(err);
        })
    });
}

/**
 *  Payment abonnement au produit
 */ 
export const paymentStripe = async(idCustomer: string | undefined, idPrice: string, quantity: number = 1): Promise<AxiosResponse>=> {
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
            await axios(getConfigAxios(`https://api.stripe.com/v1/subscriptions`, 'post', dataBody))
                .then((data: AxiosResponse) => {
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
    return await axios(getConfigAxios(`https://api.stripe.com/v1/customers/${idCustomer}`, 'get'))
}

/**
 *  Function get all cards from customer
 *  @param idCard idCard
 */ 
export const getAllCardsCustomerStripe = async(idCustomer: string | undefined) => {
    if(idCustomer === null || idCustomer === undefined) return { data: {} };
    return await axios(getConfigAxios(`https://api.stripe.com/v1/customers/${idCustomer}/sources?object=card`, 'get'))
}

/**
 *  Modifier les données clients Stripe
 */ 
export const updateCustomerStripe = async(idCustomer: string | undefined, data: any, user: UserInterface): Promise<AxiosResponse> => {
    return new Promise(async(resolve, reject) => {
        if(idCustomer === null || idCustomer === undefined){
            reject();
        }else{
            let payload: any = { 
                "email": user.email,
                "name": data.firstname+' '+data.lastname,  
            };
            const dataBody = convertToFormBody(payload);
            await axios(getConfigAxios(`https://api.stripe.com/v1/customers/${idCustomer}`, 'post', dataBody))
                .then((data: AxiosResponse) => {
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
export const deleteCustomerStripe = async(idCustomer: string | undefined): Promise<AxiosResponse>=> {
    return new Promise(async(resolve, reject) => {
        if(idCustomer === null || idCustomer === undefined){
            reject();
        }else{
            await axios(getConfigAxios(`https://api.stripe.com/v1/customers/${idCustomer}`, 'delete'))
                .then((response: AxiosResponse) => {
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
    return await axios(getConfigAxios(`https://api.stripe.com/v1/customers/${idCustomer}/sources/${idCard}`, 'get'))
}

/**
 *  Function to detach a source card from customer
 *  @param idCustomer idCustomer
 *  @param idCard idCard
 */ 
export const detachCardCustomerStripe = async(idCustomer: string, idCard: string) => {
    return await axios(getConfigAxios(`https://api.stripe.com/v1/customers/${idCustomer}/sources/${idCard}`, 'delete'))
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
 *  @param url url
 *  @param methodReq post / get / put / delete ...
 *  @param dataBody? data from body
 */ 
const getConfigAxios = (url: string, methodReq: Method, dataBody: any = null) => {
    const configaxios = {
        url: url.trim(),
        method: methodReq,
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
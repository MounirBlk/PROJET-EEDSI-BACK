import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import CommandeInterface from '../interfaces/CommandeInterface';
import CommandeModel from '../models/CommandeModel';
import path from "path";
import https from "https";
import { ClientRequest, IncomingMessage } from 'http';
import { exist, getCurrentDate } from '.';

export const generateInvoice = async (invoiceData: any, filename: string): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        const postData: string = JSON.stringify(setInvoiceData(invoiceData));
        if(!fs.existsSync(process.cwd() + '/tmp/')){
            fs.mkdirSync(process.cwd() + '/tmp/')
        }
        const file: fs.WriteStream = fs.createWriteStream(`tmp/${filename}.pdf`);
        const req: ClientRequest = https.request(getConfigHttps(postData), (res: IncomingMessage) => {
            res.on('data', (chunk) => {
                file.write(chunk);
            }).on('end', () => {
                resolve(file.end());
                //if (typeof success === 'function') success();
            })
        });
        req.write(postData);
        resolve(req.end());
        //if (typeof error === 'function') req.on('error', error);
    })
}

/**
 *  Request config 
 *  @param {string} postData 
 */ 
const getConfigHttps = (postData: string) => {
    const configHttps: https.RequestOptions = {
        hostname: "invoice-generator.com",
        port: 443,
        path: "/",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            "Accept-Language": "fr-FR"
        }
    };
    return configHttps;
}

/**
 *  Request invoice data 
 *  @param {Object} data 
 */ 
const setInvoiceData = (data: any) => {
    return {
        logo: "https://www.surmafacture.fr/wp-content/uploads/2019/11/icon-logo.png",//http://invoiced.com/img/logo-invoice.png
        from: "E-Commerce city\n17 Av. des Champs-Élysées\nParis, 75008",
        to: data.destinataire,
        ship_to: data.adresseLivraison,
        currency: "eur",
        number: data.refID,
        payment_terms: "Carte bancaire",
        date: getCurrentDate(),
        due_date: data.dateLivraison,
        items: data.items,
        fields: {
            tax: "%",
            discounts: true,
            shipping: true
        },
        discounts: 0, //Remise
        tax: 5, //Impôt taxe
        shipping: 10, //Frais de livraison
        amount_paid: 0, //Montant deja payer
        custom_fields: [{
            "name": "Statut commande",
            "value": data.statut
        },{
            "name": "Date de livraison",
            "value": data.dateLivraison,
        },{
            "name": "Livrer par (M/Mme)",
            "value": data.livreur
        }],
        notes: "Nous vous remercions de la confiance que vous accordez à l'entreprise.",
        terms: `[LIVRAISON] Le fournisseur doit inscrire, sur les bons de livraison, les numéros de lignes correspondant à notre commande. Tous les certificats demandés sont requis lors de la livraison de la commande. Ne jamais dépasser ou réduire la quantité commandée sans autorisation de l'entreprise INC. et/ou sans avoir une commandée amendée. \n\n [FACTURATION] Toutes les factures dont les prix ne correspondent pas à ceux sur notre bon de commande seront rejetées et sujettes à correction.` ,
    }
}

/**
 *  Request get invoice data 
 *  @param {CommandeInterface} data 
 */ 
export const getInvoiceData = (data: any) => {
    let items: any[] = [];
    data.articles.forEach((article: any, i: number) => {
        items.push({ name: `${i+1}- [PRODUIT] ` + article.idProduct.nom, quantity: article.quantite, unit_cost: parseFloat(article.idProduct.prix.toFixed(2)) })
        article.listeComposantsSelected.forEach((composant: any, j: number) => {
            items.push({ name: `${i+1}.${j+1}- [COMPOSANT] ` + composant.idComposant.nom, quantity: article.quantite * composant.quantite, unit_cost: parseFloat(composant.idComposant.prix.toFixed(2)) })
        });
    });
    let invoiceData = {
        destinataire: `${data.clientID.firstname} ${data.clientID.lastname}`,
        adresseLivraison: data.adresseLivraison,
        refID: data.refID,
        dateLivraison: data.dateLivraison,
        items: items,
        statut: data.statut,
        livreur: data.livreurID !== null && data.livreurID !== undefined ? data.livreurID.lastname : ''
    }
    return invoiceData;
}

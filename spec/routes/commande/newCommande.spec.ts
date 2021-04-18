import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getDateHHmm, getTimeout, randFloat, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const newCommandeSpec = () => {
    it('Test new commande: token incorrect', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/commande/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test new commande: données manquantes', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/commande/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test new commande: données erronées', (done: DoneFn) => {
        const data = {
            "dateLivraison" : randomChars(randNumber(5,10)),
            "adresseLivraison": randomChars(randNumber(10,15))
        }           
        request(app)
            .post('/commande/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    it('Test new commande: date indisponible 7 jours', (done: DoneFn) => {
        const data = {
            "dateLivraison" : getDateHHmm(),
            "adresseLivraison": randomChars(randNumber(10,15))
        }           
        request(app)
            .post('/commande/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "La date de livraison est indisponible (7 jours d'écart minimum)"
            }, done);
    }, getTimeout());

    /*it('Test new commande: success', (done: DoneFn) => {
        const data = {
            "dateLivraison" : "2100-05-20 19:47",
            "adresseLivraison": randomChars(randNumber(10,15))
        }            
        request(app)
            .post('/commande/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: "La commande a bien été ajouté"
            }, done);
    }, getTimeout());*/

}
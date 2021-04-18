import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const updateCommandeSpec = () => {
    it('Test update commande: token incorrect', (done: DoneFn) => { 
        const data = {}                  
        request(app)
            .put('/commande/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update commande: id non valide', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/commande/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test new commande: deja a jour', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/commande/update/'+ globalThis.idCommande)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: true,
                message: "Vos données sont déjà à jour"
            }, done);
    }, getTimeout());*/

    /*it('Test update commande: data non-conforme', (done: DoneFn) => {
        const data = {
            "dateLivraison" : randomChars(randNumber(1,5))
        }            
        request(app)
            .put('/commande/update/' + globalThis.idCommande)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());*/

    /*it('Test update commande: success', (done: DoneFn) => {
        const data = {
            "dateLivraison" : "2101-05-20 19:47"
        }           
        request(app)
            .put('/commande/update/' + globalThis.idCommande)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "La commande a bien été mise à jour"
            }, done);
    }, getTimeout());*/
}
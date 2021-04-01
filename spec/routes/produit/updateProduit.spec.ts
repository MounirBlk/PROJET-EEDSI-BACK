import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const updateProduitSpec = () => {
    it('Test update Produit: token incorrect', (done: DoneFn) => { 
        const data = {}                  
        request(app)
            .put('/product/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update Produit: id non valide', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/product/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test update Produit: data non-conforme', (done: DoneFn) => {
        const data = {
            composants: randomChars(randNumber(1,5)).repeat(randNumber(1,5)) // composants doit etre un tableau array et non chaine de caracteres
        }           
        request(app)
            .put('/product/update/' + globalThis.idProduit)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());*/

    /*it('Test update Produit: success', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/product/update/' + globalThis.idProduit)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "Le produit a bien été mise à jour"
            }, done);
    }, getTimeout());*/
}
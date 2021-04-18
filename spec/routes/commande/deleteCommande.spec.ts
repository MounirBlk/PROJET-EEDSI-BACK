import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const deleteCommandeSpec = () => {
    it('Test delete commande: token incorrect', (done: DoneFn) => {      
        request(app)
            .delete('/commande/delete/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test delete commande: id non valide', (done: DoneFn) => { 
        request(app)
            .delete('/product/delete/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test delete commande: success', (done: DoneFn) => {
        request(app)
            .delete('/commande/delete/' + globalThis.idCommande)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: 'La commande a été supprimé avec succès'
            }, done);
    }, getTimeout());*/
}
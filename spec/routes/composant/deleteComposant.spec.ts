import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const deleteComposantSpec = () => {
    it('Test delete Composant: token incorrect', (done: DoneFn) => {      
        request(app)
            .delete('/composant/delete/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test delete Composant: id non valide', (done: DoneFn) => { 
        request(app)
            .delete('/composant/delete/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test delete Composant: success', (done: DoneFn) => {
        request(app)
            .delete('/composant/delete/' + globalThis.idComposant)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: 'Le composant a été supprimé avec succès'
            }, done);
    }, getTimeout());*/
}
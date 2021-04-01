import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const updateComposantSpec = () => {
    it('Test update Composant: token incorrect', (done: DoneFn) => { 
        const data = {}                  
        request(app)
            .put('/composant/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update Composant: id non valide', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/composant/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test update Composant: data non-conforme', (done: DoneFn) => {
        const data = {
            matieres: randomChars(randNumber(1,5)).repeat(randNumber(1,5)) // composants doit etre un tableau array et non chaine de caracteres
        }           
        request(app)
            .put('/composant/update/' + globalThis.idComposant)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());*/

    /*it('Test update Composant: success', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/composant/update/' + globalThis.idComposant)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "Le composant a bien été mise à jour"
            }, done);
    }, getTimeout());*/
}
import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const updateEntrepriseSpec = () => {
    it('Test update Entreprise: token incorrect', (done: DoneFn) => {
        const data = {
            telephone: '0179985475'
        }               
        request(app)
            .put('/entreprise/' + globalThis.idEntreprise)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update Entreprise: id non valide', (done: DoneFn) => {
        const data = {
            telephone: '0179985475' // taille du tel doit etre compris entre 1 et 25
        }           
        request(app)
            .put('/entreprise/' + globalThis.idEntreprise + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test update Entreprise: data non-conforme', (done: DoneFn) => {
        const data = {
            telephone: '0179985475'.repeat(10) // taille du tel doit etre compris entre 1 et 25
        }           
        request(app)
            .put('/entreprise/' + globalThis.idEntreprise)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    it('Test update Entreprise: success', (done: DoneFn) => {
        const data = {
            telephone: '0179985475' // taille du tel doit etre compris entre 1 et 25
        }           
        request(app)
            .put('/entreprise/' + globalThis.idEntreprise)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "L'entreprise a bien été mise à jour"
            }, done);
    }, getTimeout());
}
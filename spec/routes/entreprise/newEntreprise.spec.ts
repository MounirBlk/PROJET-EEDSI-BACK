import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

const siret : string = '44306184100047';

export const newEntrepriseSpec = () => {
    it('Test new Entreprise: token incorrect', (done: DoneFn) => {
        const data = {
            siret: String(randNumber(1,9)).repeat(14),//taille d'un siret est de 14
        }           
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test new Entreprise: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: 'Le siret ne peut pas être vide'
            }, done);
    }, getTimeout());

    it('Test new Entreprise: siret invalide', (done: DoneFn) => {
        const data = {
            siret: String(randNumber(1,9)).repeat(randNumber(1,13)),//taille d'un siret doit etre de 14 
        }        
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Le siret n'est pas valide"
            }, done);
    }, getTimeout());
    
    /*it('Test new Entreprise: success', (done: DoneFn) => {
        const data = {
            siret: siret,//SIRET de google entreprise
        }        
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(201, {
                error: true,
                message: "L'entreprise a bien été ajoutée avec succès"
            }, done);
    }, getTimeout());*/

    /*it('Test new Entreprise: existe deja', (done: DoneFn) => {
        const data = {
            siret: siret,//SIRET de google entreprise
        }        
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Cette entreprise est déjà enregistré"
            }, done);
    }, getTimeout());*/
}
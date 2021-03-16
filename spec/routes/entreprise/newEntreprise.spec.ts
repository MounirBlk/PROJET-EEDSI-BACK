import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const newEntrepriseSpec = () => {
    it('Test new Entreprise: token incorrect', (done: DoneFn) => {
        const data = {}           
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
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test new Entreprise: données erronées', (done: DoneFn) => {
        const data = {
            siret: randNumber(1000000000000, 9999999999999),//nécessite 14 chiffres
            nom: randomChars(randNumber(5,10)),
            adresse: randomChars(randNumber(5,10)) + ' rue ' + randomChars(randNumber(10,10)) + ' ' + randNumber(10000,99999),
            categorieEntreprise : 'PME',
            etatAdministratif: randNumber(1,2) ? 'Actif' : 'Ferme',
            categorieJuridique: randNumber(1000,9999)
        }           
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    it('Test new Entreprise: success', (done: DoneFn) => {
        globalThis.siret = randNumber(10000000000000, 99999999999999)
        const data = {
            siret: globalThis.siret,
            nom: randomChars(randNumber(5,10)),
            adresse: randomChars(randNumber(5,10)) + ' rue ' + randomChars(randNumber(10,10)) + ' ' + randNumber(10000,99999),
            categorieEntreprise : 'PME',
            etatAdministratif: randNumber(1,2) ? 'Actif' : 'Ferme',
            categorieJuridique: randNumber(1000,9999)
        }           
        request(app)
            .post('/entreprise')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: "L'entreprise a bien été ajoutée avec succès"
            }, done);
    }, getTimeout());

    it('Test new Entreprise : existe deja', (done: DoneFn) => {
        const data = {
            siret: globalThis.siret,
            nom: randomChars(randNumber(5,10)),
            adresse: randomChars(randNumber(5,10)) + ' rue ' + randomChars(randNumber(10,10)) + ' ' + randNumber(10000,99999),
            categorieEntreprise : 'PME',
            etatAdministratif: randNumber(1,2) ? 'Actif' : 'Ferme',
            categorieJuridique: randNumber(1000,9999)
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
    }, getTimeout());
}
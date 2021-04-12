import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randFloat, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const newArticleSpec = () => {
    it('Test new Article: token incorrect', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/panier/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test new Article: données manquantes 1', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/panier/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test new Article: données erronées 1', (done: DoneFn) => {
        const data = {
            "idProduct": randomChars(24),
            "matiere": "Bois",
            "couleur": "Rouge",
            "quantite": randomChars(100),// number pas string
            "listeComposantsSelected": []
        }         
        request(app)
            .post('/panier/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    /*it('Test new Article: données manquantes 2', (done: DoneFn) => {
        const data = {
            "idProduct": globalThis.idProduct,
            "matiere": "Bois",
            "couleur": "Rouge",
            "quantite": "1",
            "listeComposantsSelected": [{
                "idComposant": "",// donnée manquante
                "matiere": "Metal",
                "couleur": "",// donnée manquante
                "quantite": "1"
            }]
        }          
        request(app)
            .post('/panier/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());*/

    /*it('Test new Article: données erronées 2', (done: DoneFn) => {
        const data = {
            "idProduct": globalThis.idProduct,
            "matiere": "Bois",
            "couleur": "Rouge",
            "quantite": "1",
            "listeComposantsSelected": [{
                "idComposant": "6073480f58c96d3cf429630f",
                "matiere": "Metal",
                "couleur": randNumber(1, 100),// string pas number
                "quantite": "1"
            }]
        }             
        request(app)
            .post('/panier/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());*/

    /*it('Test new Article: success', (done: DoneFn) => {
        const data = {
            "idProduct": globalThis.idProduct,
            "matiere": "Bois",
            "couleur": "Rouge",
            "quantite": "1",
            "listeComposantsSelected": [{
                "idComposant": globalThis.idComposant,
                "matiere": "Metal",
                "couleur": "Bleu",
                "quantite": "1"
            }]
        }       
        request(app)
            .post('/panier/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: 'L\'article a bien été ajouté au panier'
            }, done);
    }, getTimeout());*/
}
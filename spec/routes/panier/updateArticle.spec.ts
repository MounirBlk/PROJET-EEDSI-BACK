import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randFloat, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const updateArticleSpec = () => {
    it('Test update Article: token incorrect', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/panier/update/'+ randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test update Article: id non valide', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/panier/update/' + randomChars(randNumber(1,5)))
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test update Article: données manquantes 1', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/panier/update/' + globalThis.idArticle)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());*/

    /*it('Test update Article: données erronées 1', (done: DoneFn) => {
        const data = {
            "idProduct": randomChars(24),
            "matiere": "Bois",
            "couleur": "Rouge",
            "quantite": randomChars(100),// number pas string
            "listeComposantsSelected": []
        }         
        request(app)
            .put('/panier/update/' + globalThis.idArticle)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());*/

    /*it('Test update Article: données manquantes 2', (done: DoneFn) => {
        const data = {
            "idProduct": randomChars(24),
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
            .put('/panier/update/' + globalThis.idArticle)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());*/

    /*it('Test update Article: données erronées 2', (done: DoneFn) => {
        const data = {
            "idProduct": randomChars(24),
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
            .put('/panier/update/' + globalThis.idArticle)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());*/

    /*it('Test update Article: success', (done: DoneFn) => {
        const data = {}           
        request(app)
            .put('/panier/update/' + globalThis.idArticle)
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "L'article a bien été mise à jour"
            }, done);
    }, getTimeout());*/
}
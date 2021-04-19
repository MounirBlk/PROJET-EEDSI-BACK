import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randFloat, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const newComposantSpec = () => {
    it('Test new Composant: token incorrect', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/composant/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test new Composant: données manquantes', (done: DoneFn) => {
        const data = {}           
        request(app)
            .post('/composant/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test new Composant: données erronées', (done: DoneFn) => {
        const data = {
            "nom" : "Chaise en " + randomChars(randNumber(5,10)),
            "description": "description " +randomChars(randNumber(5,10)),
            "type": randNumber(5,10),//errone
            "matieres": ["Metal", "Bois", "Plastique", "Polymére"],//errone
            "couleurs": ["rouge", "orange", "jaune", "chartreuse","vert"],//errone
            "poids": randNumber(50,1000), 
            "longueur": randNumber(30,400),
            "largeur": randNumber(30,200),
            "profondeur": randNumber(30,70),
            "prix": randFloat(300,700),
            "quantite": randNumber(1,20),
        }           
        request(app)
            .post('/composant/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Une ou plusieurs données sont erronées"
            }, done);
    }, getTimeout());

    /*it('Test new Composant: success', (done: DoneFn) => {
        const data = {
            "nom" : "Decor pour chaise",
            "description": "description composant",
            "type": "chaise",
            "matieres": ["Metal", "Bois", "Plastique", "Polymére"],
            "couleurs": ["rouge", "orange", "jaune", "chartreuse","vert", "turquoise", "cyan", "outremer", "bleu", "violet", "magenta", "carmin"],
            "poids": "5000", 
            "longueur": "500",
            "largeur": "260",
            "profondeur": "50",
            "prix": "5.51",
            "quantite": "5",
        }           
        request(app)
            .post('/composant/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(201, {
                error: false,
                message: "Le composant a bien été ajoutée avec succès"
            }, done);
    }, getTimeout());*/

    /*it('Test new Composant : existe deja', (done: DoneFn) => {
        const data = {
            "nom" : "Decor pour chaise",
            "description": "description composant",
            "type": "chaise",
            "matieres": ["Metal", "Bois", "Plastique", "Polymére"],
            "couleurs": ["rouge", "orange", "jaune", "chartreuse","vert", "turquoise", "cyan", "outremer", "bleu", "violet", "magenta", "carmin"],
            "poids": "5000", 
            "longueur": "500",
            "largeur": "260",
            "profondeur": "50",
            "prix": "5.51",
            "quantite": "5",
        }        
        request(app)
            .post('/composant/add')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Ce composant est déjà enregistré"
            }, done);
    }, getTimeout());*/
}
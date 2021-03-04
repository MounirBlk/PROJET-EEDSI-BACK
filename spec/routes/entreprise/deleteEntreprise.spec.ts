import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const deleteEntrepriseSpec = () => {
    it('Test delete Entreprise: token incorrect', (done: DoneFn) => {       
        request(app)
            .delete('/entreprise/' + globalThis.idEntreprise)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test delete Entreprise: id non valide', (done: DoneFn) => { 
        request(app)
            .delete('/entreprise/' + globalThis.idEntreprise + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test delete Entreprise: success', (done: DoneFn) => { 
        request(app)
            .delete('/entreprise/' + globalThis.idEntreprise)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: true,
                message: 'L\'entreprise a été supprimé avec succès'
            }, done);
    }, getTimeout());*/
}
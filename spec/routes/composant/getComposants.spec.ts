import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';
import ProductInterface from "../../../src/interfaces/ProductInterface";

export const getComposantsSpec = () => {
    /*it('Test get Composants: token incorrect', (done: DoneFn) => { 
        request(app)
            .get('/composant/all')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());*/

    /*it('Test get Composants: success', (done: DoneFn) => {
        request(app)
            .get('/composant/all')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les composants ont bien été récupéré",
                    composants: response.body.composants
                })
                const composantSelected: Array<ProductInterface> = response.body.composants.filter((item: ProductInterface) => item.nom === globalThis.nomComposant);
                globalThis.idComposant = composantSelected[0]._id;//forcément que un element
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());*/
}
import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';
import ProductInterface from "../../../src/interfaces/ProductInterface";

export const getComposantsSpec = () => {
    it('Test get Produits: token incorrect', (done: DoneFn) => { 
        request(app)
            .get('/product/all')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    /*it('Test get Produits: success', (done: DoneFn) => {
        request(app)
            .get('/product/all')
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "Les produits ont bien été récupéré",
                    products: response.body.products
                })
                const productSelected: Array<ProductInterface> = response.body.products.filter((item: ProductInterface) => item.nom === globalThis.nomProduit);
                globalThis.idProduit = productSelected[0]._id;//forcément que un element
                return done();
            })
            .catch(err => {
                throw err;
            })
    }, getTimeout());*/
}
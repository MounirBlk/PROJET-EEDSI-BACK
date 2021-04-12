import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';


export const deleteArticleSpec = () => {
    it('Test delete Article: token incorrect', (done: DoneFn) => {      
        request(app)
            .delete('/panier/delete/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test delete Article: id non valide', (done: DoneFn) => { 
        request(app)
            .delete('/panier/delete/' + randomChars(randNumber(1,5)))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    /*it('Test delete Article: success', (done: DoneFn) => {
        request(app)
            .delete('/panier/delete/' + globalThis.idArticle)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: 'L\'article a bien été retiré du panier'
            }, done);
    }, getTimeout());*/
}
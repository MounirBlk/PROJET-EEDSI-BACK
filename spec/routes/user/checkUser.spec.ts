import request from "supertest"
import app from "../../../app";
import { getTimeout, randomChars } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const checkUserTest = () => {
    return (done: DoneFn) => {
        request(app)
            .get('/check/'+ globalThis.tokenInfos)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, {
                error: false,
                message: "L'email a bien été confirmé"
            })
            .end((err: any, res: any) => {
                if (err) throw err;
                return done();
            });
    };
};

export const checkUserSpec = () => {
    it('Test check: token incorrect', (done: DoneFn) => {
        request(app)
            .get('/check/'+ randomChars(100))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());
}
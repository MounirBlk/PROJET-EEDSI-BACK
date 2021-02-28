import request from "supertest"
import app from "../../app";
import { getTimeout, randomChars } from "../helpers";
import fs from 'fs';
import path from 'path';

describe('Test delete user by rest API', () => {
    it('Test delete: token incorrect', (done: DoneFn) => {
        request(app)
            .delete('/user')
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());
});
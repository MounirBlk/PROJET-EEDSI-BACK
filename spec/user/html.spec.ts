import request from "supertest"
import { convertToFormBody, exist, getTimeout, randNumber, randomChars, randomDate, randomFileName } from "../helpers";
import fs from 'fs';
import path from 'path';
import app from "../../app";

//describe('Test html pages', () => {
export const htmlSpec = () => {
    it('Test index.html', (done: DoneFn) => {
        request(app)
            .get('/')
            .expect(200, done);
    }, getTimeout());

    it('Test index.html', (done: DoneFn) => {
        request(app)
            .get('')
            .expect(200, done);
    }, getTimeout());

    it('Test error.html', (done: DoneFn) => {
        request(app)
            .get(`/${randomChars()}`)
            .expect(404, done);
    }, getTimeout());
}
//})
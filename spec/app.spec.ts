import request from "supertest"
import app from "../app";
import { randomChars } from "./helpers";
//const request = require('supertest');

describe('test index.html and error.html', () => {
    it('Test index.html', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    }, 60000);

    it('Test index.html', (done) => {
        request(app)
            .get('')
            .expect(200, done);
    }, 60000);

    it('Test error.html', (done) => {
        request(app)
            .get(`/${randomChars()}`)
            .expect(404, done);
    }, 60000);
})

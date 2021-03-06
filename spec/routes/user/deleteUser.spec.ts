import request from "supertest"
import app from "../../../app";
import { getTimeout, randomChars } from "../../helpers";
import fs from 'fs';
import path from 'path';

export const deleteUserTest = () => {
    return (done: DoneFn) => {
        request(app)//app
        .delete('/user/' + globalThis.idUser)
        .set('Accept', 'application/json')
        //.set('Authorization', `Bearer ${token}`) //fonctionne aussi normalement
        .auth(globalThis.tokenInfos, { type: 'bearer' })
        .expect('Content-Type', /json/)
        .expect(200, {
            error: false,
            message: 'L\'utilisateur a été supprimé avec succès'
        })
        .end((err: any, res: any) => {
            if (err) throw err;
            fs.existsSync(process.cwd() + '/logs') ? fs.rmdirSync(process.cwd() + '/logs', { recursive: true }) : null;
            console.log('end')
            return done();
        });
    };
};

export const deleteUserSpec = () => {
    it('Test delete: token incorrect', (done: DoneFn) => {
        request(app)
            .delete('/user/' + globalThis.idUser)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(498, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test delete: id invalide', (done: DoneFn) => {
        request(app)
            .delete('/user/' + randomChars(100))
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());
};
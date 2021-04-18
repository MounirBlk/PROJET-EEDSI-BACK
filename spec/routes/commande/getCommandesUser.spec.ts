import request from "supertest"
import app from "../../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../../helpers";
import fs from 'fs';
import path from 'path';
import { roleTypes } from "../../../src/types/roleTypes";

export const getCommandesUserSpec = (role: roleTypes) => {
    it('Test get commandes user: token incorrect', (done: DoneFn) => {       
        request(app)
            .get(`/commande/user/${randomChars(randNumber(1,5))}/${randomChars(randNumber(1,5))}`)
            .set('Accept', 'application/json')
            .auth(randomChars(100), { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(401, {
                error: true,
                message: 'Votre token n\'est pas correct'
            }, done);
    }, getTimeout());

    it('Test get commandes user: id non valide', (done: DoneFn) => { 
        request(app)
            .get(`/commande/user/client/${randomChars(randNumber(1,5))}`)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "L'id n'est pas valide !"
            }, done);
    }, getTimeout());

    it('Test get commandes user: role non valide', (done: DoneFn) => { 
        request(app)
            .get(`/commande/user/${randomChars(randNumber(1,5))}/${globalThis.idUser}`)
            .set('Accept', 'application/json')
            .auth(globalThis.tokenInfos, { type: 'bearer' })
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: "Le role n'est pas valide !"
            }, done);
    }, getTimeout());

    if(role.trim().toLowerCase() === 'livreur' || role.trim().toLowerCase() === 'client' || role.trim().toLowerCase() === 'prospect'){
        it('Test get commandes user: success', (done: DoneFn) => {
            request(app)
                .get(`/commande/user/${role}/${globalThis.idUser}`)
                .set('Accept', 'application/json')
                .auth(globalThis.tokenInfos, { type: 'bearer' })
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response: any) => {
                    expect(response.status).toEqual(200)
                    expect(response.body).toEqual({
                        error: false,
                        message: `Les commandes liées au ${role.trim().toLowerCase()} ont bien été récupéré`,
                        commandes: response.body.commandes
                    })
                    return done();
                })
                .catch(err => {
                    throw err;
                })
        }, getTimeout());
    }
}
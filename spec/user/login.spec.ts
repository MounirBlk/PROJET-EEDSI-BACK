import request from "supertest"
import app from "../../app";
import { convertToFormBody, getTimeout, randNumber, randomChars, randomFileName } from "../helpers";
import fs from 'fs';
import async from 'async';

export const loginUserTest = () => {
    return (done: DoneFn) => {
        request(app)
            .post('/login')
            .send(convertToFormBody({
                email: globalThis.emailInfos,
                password: globalThis.passwordInfos,
            }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({
                    error: false,
                    message: "L'utilisateur a été authentifié avec succès",
                    token: response.body.token
                })
                const token: string = response.body.token;
                globalThis.tokenInfos = token;
                return done();
            })
            .catch(err => {
                throw err;
            })
    };
};

export const loginUserSpec = () => {
    it('Test login: données manquantes', (done: DoneFn) => {
        const data = {}
        request(app)
            .post('/login')
            .send(convertToFormBody(data))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, {
                error: true,
                message: "Une ou plusieurs données obligatoire sont manquantes"
            }, done);
    }, getTimeout());

    it('Test login: données non-conformes', (done: DoneFn) => {
        request(app)
            .post('/login')
            .send(convertToFormBody({
                email: randomChars(randNumber(5,10)),//Manque le @ et le .
                password: '123',// Format incorrecte
            }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: 'Email/password incorrect'
            }, done);
    }, getTimeout());

    it('Test login: email not exist in base', (done: DoneFn) => {
        request(app)
            .post('/login')
            .send(convertToFormBody({
                email: randomChars(4) + randomFileName() +'@gmail.com',
                password: randomChars(randNumber(5,10)).concat('*') + randNumber(1,100),
            }))
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409, {
                error: true,
                message: 'Email/password incorrect'
            }, done);
    }, getTimeout());
    
    const testManyAuth = (emailTest: string, isManyRequests: boolean, done: DoneFn): any => {
        //let promiseList: any[] = [];
        //for(let i = 0; i < 5; i++){
            //promiseList.push(
                //() => {
                return request(app)
                    .post('/login')
                    .send(convertToFormBody({
                        email: emailTest,
                        password: randomChars(randNumber(5,10)).concat('!') + randNumber(1,100),
                    }))
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(!isManyRequests ? 409 : 429, {
                        error: true,
                        message: !isManyRequests ? 'Email/password incorrect' : "Trop de tentative sur l'email " + emailTest + " (5 max) - Veuillez patienter (2mins)"
                    })
                    .end((err: any, res: any) => {
                        if (err) throw err;
                        return done();
                    })                   
                //}
            //);
        //}
        //fs.writeFileSync(process.cwd() + '/logs/test.txt', JSON.stringify(promiseList));
        //return promiseList;
    }
    for(let i = 0; i < 10; i++){
        it('Test login: mot de passe incorrect', (done: DoneFn) => {
            testManyAuth(globalThis.emailInfos, i < 5 ? false : true, done);
            //async.parallel(testManyAuth(emailTest, isManyRequests, done), done);
        }, getTimeout());
    }
};
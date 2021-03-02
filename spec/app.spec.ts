declare global {
    var tokenInfos: string;
    var emailInfos: string;
    var passwordInfos: string;
}
import { getTimeout, randNumber } from "./helpers";
import * as index from "./routes/index.spec";
import { checkUserTest } from "./user/checkUser.spec";
import { deleteUserTest } from "./user/deleteUser.spec";
import { loginUserTest } from "./user/login.spec";
import { registerUserTest } from "./user/register.spec";

const role = ["Administrateur", "Commercial", "Livreur", "Client"]
const iteratorTest = randNumber(1, 1); // random number btw min and max pour le nbre d'iteration des tests

for(let i = 0; i < iteratorTest; i++){
    describe('TEST API E-COMMERCE', () => {
        beforeAll(registerUserTest(role), getTimeout(120));// Before all tests of specs (register)
        beforeAll(loginUserTest(), getTimeout(120));// Before all tests of specs (login)
        beforeAll(checkUserTest(), getTimeout(120));// Before all tests of specs (check)

        //beforeEach(() => console.log(__dirname));
        //afterEach(() => console.log('Test passed'))
    
        index.userSpec(role); // All tests user
        index.productSpec(); // All tests produit
    
        afterAll(deleteUserTest(), getTimeout(60));// After all tests of specs
    })
}


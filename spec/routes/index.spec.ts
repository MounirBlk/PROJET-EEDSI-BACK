import { roleTypes } from "../../src/types/roleTypes";
import { deleteEntrepriseSpec } from "./entreprise/deleteEntreprise.spec";
import { getEntrepriseSpec } from "./entreprise/getEntreprise.spec";
import { getEntreprisesSpec } from "./entreprise/getEntreprises.spec";
import { newEntrepriseSpec } from "./entreprise/newEntreprise.spec";
import { updateEntrepriseSpec } from "./entreprise/updateEntreprise.spec";
import { checkUserSpec } from "./user/checkUser.spec";
import { deleteUserSpec } from "./user/deleteUser.spec"
import { disableUserSpec } from "./user/disableUser.spec";
import { forgotPasswordUserSpec } from "./user/forgotPassword.spec";
import { getUserSpec } from "./user/getUser.spec";
import { htmlSpec } from "./user/html.spec";
import { loginUserSpec } from "./user/login.spec"
import { registerUserSpec } from "./user/register.spec"
import { updateUserSpec } from "./user/updateUser.spec";

//ATTENTION: l'ordre des functions est très important !!!
export const userSpec = (role: Array<roleTypes>) => {
    htmlSpec();//1
    deleteUserSpec();//2
    registerUserSpec(role);//3
    loginUserSpec();//4
    getUserSpec();//5
    updateUserSpec();//6
    disableUserSpec();//7
    forgotPasswordUserSpec();//8
    checkUserSpec();//9
}

//ATTENTION: l'ordre des functions est très important !!!
export const entrepriseSpec = () => {
    newEntrepriseSpec()//1
    getEntreprisesSpec()//2
    updateEntrepriseSpec()//3
    getEntrepriseSpec()//4   
    deleteEntrepriseSpec()//5
}

//ATTENTION: l'ordre des functions est très important !!!
export const productSpec = () => {

}
import { deleteComposantSpec } from "./composant/deleteComposant.spec";
import { getComposantSpec } from "./composant/getComposant.spec";
import { getComposantsSpec } from "./composant/getComposants.spec";
import { newComposantSpec } from "./composant/newComposant.spec";
import { updateComposantSpec } from "./composant/updateComposant.spec";
import { deleteEntrepriseSpec } from "./entreprise/deleteEntreprise.spec";
import { getEntrepriseSpec } from "./entreprise/getEntreprise.spec";
import { getEntreprisesSpec } from "./entreprise/getEntreprises.spec";
import { newEntrepriseSpec } from "./entreprise/newEntreprise.spec";
import { newEntrepriseAutoSpec } from "./entreprise/newEntrepriseAuto.spec";
import { updateEntrepriseSpec } from "./entreprise/updateEntreprise.spec";
import { deleteArticleSpec } from "./panier/deleteArticle.spec";
import { getArticleSpec } from "./panier/getArticle.spec";
import { getArticlesSpec } from "./panier/getArticles.spec";
import { newArticleSpec } from "./panier/newArticle.spec";
import { updateArticleSpec } from "./panier/updateArticle.spec";
import { deleteProduitSpec } from "./produit/deleteProduit.spec";
import { getProduitSpec } from "./produit/getProduit.spec";
import { getProduitsSpec } from "./produit/getProduits.spec";
import { newProduitSpec } from "./produit/newProduit.spec";
import { updateProduitSpec } from "./produit/updateProduit.spec";
import { checkUserSpec } from "./user/checkUser.spec";
import { deleteUserSpec } from "./user/deleteUser.spec"
import { disableUserSpec } from "./user/disableUser.spec";
import { forgotPasswordUserSpec } from "./user/forgotPassword.spec";
import { getOneUserSpec } from "./user/getOneUser.spec";
import { getOwnUserSpec } from "./user/getOwnUser.spec";
import { getUsersSpec } from "./user/getUsers.spec";
import { htmlSpec } from "./user/html.spec";
import { loginUserSpec } from "./user/login.spec"
import { registerUserSpec } from "./user/register.spec"
import { updateUserSpec } from "./user/updateUser.spec";

//ATTENTION: l'ordre des functions est très important !!!
export const userSpec = (selectedRole: string) => {
    htmlSpec();//1
    getUsersSpec(selectedRole);//2
    deleteUserSpec();//3
    registerUserSpec(selectedRole);//4
    loginUserSpec();//5
    getOwnUserSpec();//6
    getOneUserSpec();//7
    updateUserSpec();//8
    disableUserSpec();//9
    forgotPasswordUserSpec();//10
    checkUserSpec();//111
}

//ATTENTION: l'ordre des functions est très important !!!
export const entrepriseSpec = () => {
    newEntrepriseSpec()//1
    newEntrepriseAutoSpec()//2
    getEntreprisesSpec()//3
    updateEntrepriseSpec()//4
    getEntrepriseSpec()//5 
    deleteEntrepriseSpec()//6
}

//ATTENTION: l'ordre des functions est très important !!!
export const productSpec = () => {
    newProduitSpec()//1
    getProduitsSpec()//2
    updateProduitSpec()//3
    getProduitSpec()//4 
    deleteProduitSpec()//5
}

//ATTENTION: l'ordre des functions est très important !!!
export const composantSpec = () => {
    newComposantSpec()//1
    getComposantsSpec()//2
    updateComposantSpec()//3
    getComposantSpec()//4
    deleteComposantSpec()//5
}

//ATTENTION: l'ordre des functions est très important !!!
export const articleSpec = () => {
    newArticleSpec()//1
    getArticlesSpec()//2
    updateArticleSpec()//3
    getArticleSpec()//4
    deleteArticleSpec()//5
}
import { Document } from "mongoose"
import { etatAdministratifTypes } from "../types/etatAdministratifTypes";

export default interface EntrepriseInterface extends Document {
    //_id: { $oid: string }|null|string;
    siret: number;
    nom?: string;
    adresse?: string;
    telephone?: string;
    siren?: number;
    numeroTvaIntra?: string;
    categorieEntreprise?: string;
    categorieJuridique?: number;//permet de recuperer le status de l'entreprise SARL/SAS/SASU etc
    dateCreation?: string;
    etatAdministratif?: etatAdministratifTypes; //Actif ou Fermé
    createdAt?: Date;
    updateAt?: Date;
}
import { Application } from "express";
import commun from "./commun";
import mobile from "./mobile";
import software from "./software";
import web from "./web";

export const route = (app: Application): void => {
    commun(app);
    software(app);
    mobile(app);
    web(app);
}
import * as shell from "shelljs";

shell.cp("-R", "public/", "dist/");
shell.cp("-R", "src/middlewares/templates", "dist/src/middlewares/templates");
import { Router } from "express";

import { getUsers, getRank } from "../Controllers/usersController.js";

const usersRouter = Router();

usersRouter.get("/users/:id", getUsers);
usersRouter.get("/ranking", getRank);


export default usersRouter;
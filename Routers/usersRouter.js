import { Router } from "express";

import { getUsers, getRank } from "../Controllers/usersController.js";

const usersRouter = Router();

usersRouter.get("/users/ranking", getRank);
usersRouter.get("/users/:id", getUsers);


export default usersRouter;
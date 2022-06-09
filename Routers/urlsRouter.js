import { Router } from "express";

import {getUrls, postUrls} from "../Controllers/urlsController.js";

const urlsRouter = Router();

urlsRouter.post("/urls/shorten", postUrls);
urlsRouter.get("/urls/:id", getUrls);

export default urlsRouter;
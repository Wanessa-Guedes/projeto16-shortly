import { Router } from "express";

import {postUrls} from "../Controllers/urlsController.js";

const urlsRouter = Router();

urlsRouter.post("/urls/shorten", postUrls);

export default urlsRouter;
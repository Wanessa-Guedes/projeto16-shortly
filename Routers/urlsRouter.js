import { Router } from "express";

import {deleteUrl, getShortUrl, getUrls, postUrls} from "../Controllers/urlsController.js";

const urlsRouter = Router();

urlsRouter.post("/urls/shorten", postUrls);
urlsRouter.get("/urls/:id", getUrls);
urlsRouter.get("/urls/open/:shortUrl", getShortUrl);
urlsRouter.delete("/urls/:id", deleteUrl)


export default urlsRouter;
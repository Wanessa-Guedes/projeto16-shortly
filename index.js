import express, {json} from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./Routers/authRouter.js";
import urlsRouter from "./Routers/urlsRouter.js";
import usersRouter from "./Routers/usersRouter.js";

dotenv.config();

const app = express();
app.use(json());
app.use(cors());

app.use(authRouter);

app.use(urlsRouter);

app.use(usersRouter);

const PORTA = process.env.PORT || 4000;
app.listen(PORTA, () => {
    console.log(`Back-end on na porta ${PORTA}`);
});
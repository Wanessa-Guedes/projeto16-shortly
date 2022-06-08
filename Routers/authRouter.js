import { postSignUp, postSignIn } from ".././Controllers/authController.js";
import signUpSchemaValidate from ".././Middlewares/signUpSchemaValidate.js";
import signInSchemaValidate from ".././Middlewares/signInSchemaValidate.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", signUpSchemaValidate, postSignUp);
authRouter.post("/signin", signInSchemaValidate, postSignIn);


export default authRouter;
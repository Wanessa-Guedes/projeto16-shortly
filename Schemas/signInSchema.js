import Joi from "joi";

const signInSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
})

export default signInSchema;
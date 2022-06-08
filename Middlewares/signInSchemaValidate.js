import signInSchema from "../Schemas/signInSchema.js";

export default function signInSchemaValidate(req,res,next){

    const { error, value } = signInSchema.validate(req.body, {abortEarly: false});
        
    if(error){
    return res.status(422).send(error.details.map(detail => detail.message));
    }

    next();
}
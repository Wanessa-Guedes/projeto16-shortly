import connection from ".././database.js";
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import dotenv from "dotenv";

dotenv.config();

export async function postUrls(req,res){

    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "").trim();

    if(!token){
        return res.status(401).send(`Nenhum token enviado`);
    }

    const secretKey = process.env.JWT_SECRET;
    const userInfo = jwt.verify(token, secretKey);
    delete userInfo.iat;

    try{
        
        const userAuthorized = await connection.query(`SELECT * FROM sessions WHERE "token"=$1`, [token]);
        if(userAuthorized.rowCount == 0){
            return res.status(401).send(`Token não cadastrado`);
        } 
        
        const shortlyUrl = nanoid(6);
        console.log(`Teste da url encurtada`, shortlyUrl);
        await connection.query(`INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1,$2,$3)`,
                                [userInfo.id, req.body.url, shortlyUrl]);
        res.status(201).send({"shortUrl": shortlyUrl});

    } catch (e){
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota de postUrls");
    }
}

//TODO: GET /urls/:id
//TODO: GET /urls/open/:shortUrl
//TODO: DELETE /urls/:id
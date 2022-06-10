import connection from ".././database.js";
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import dotenv from "dotenv";


dotenv.config();

export async function postUrls(req,res){

    let error = null;

    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "").trim();

    if(!token){
        return res.sendStatus(401);
    }

    const secretKey = process.env.JWT_SECRET;
    let userInfo = null;
    userInfo = jwt.verify(token, secretKey, function(err, decoded) {
        if (err){
            error = err;
        }
    }); 

    if(error){
        return res.sendStatus(401);
    } else {
        userInfo = jwt.verify(token, secretKey);
    }
    delete userInfo.iat;

    try{

        const userAuthorized = await connection.query(`SELECT * FROM sessions WHERE "token"=$1 and 
                                                        "userId"=$2`, [token, parseInt(userInfo.id)]);
        if(userAuthorized.rowCount == 0){
            return res.sendStatus(401);
        } 
        
        const shortlyUrl = nanoid(8);
        console.log(`Teste da url encurtada`, shortlyUrl);
        await connection.query(`INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1,$2,$3)`,
                                [userInfo.id, req.body.url, shortlyUrl]);
        res.status(201).send({"shortUrl": shortlyUrl});

    } catch (e){
        console.log(e);
        res.status(500).send("Ocorreu um erro na rota de postUrls");
    }
}

//TODO: GET /urls/:id
export async function getUrls(req,res){

    if(isNaN(req.params.id)){
        return res.sendStatus(422);
    }

    try{
        const urlInfo = await connection.query(`SELECT urls.id, urls."shortUrl", urls.url FROM urls 
        WHERE urls.id=$1`, [parseInt(req.params.id)]);
        if(urlInfo.rowCount == 0){
            return res.sendStatus(404);
        }
        res.status(200).send(urlInfo.rows);
    }catch (e){
        console.log(e);
        res.status(500).send("Ocorreu um erro na rota de getUrls");
    }
}
//TODO: GET /urls/open/:shortUrl
export async function getShortUrl(req,res){

    if(!req.params.shortUrl){
        return res.sendStatus(422);
    } 
    
    try{
        const url = await connection.query(`SELECT urls.url FROM urls WHERE urls."shortUrl"=$1`, [req.params.shortUrl]);
        if(url.rowCount == 0){
            return res.status(404);
        }
        await connection.query(`UPDATE urls SET visualization = visualization + 1 
                                WHERE urls."shortUrl"=$1`, [req.params.shortUrl]);
        //TODO: MOSTRAR O ERRO AO TUTOR
        res.redirect(url.rows[0].url);
    } catch (e){
        console.log(e);
        res.status(500).send("Ocorreu um erro na rota de getShortUrl"); 
    }
}
//TODO: DELETE /urls/:id
export async function deleteUrl(req,res){

    let error = null;
    
    if(isNaN(req.params.id)){
        return res.sendStatus(422);
    }

    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "").trim();

    if(!token){
        return res.status(404).send(`Nenhum token enviado`);
    }

    const secretKey = process.env.JWT_SECRET;
    let userInfo = null;
    userInfo = jwt.verify(token, secretKey, function(err, decoded) {
        if (err){
            error = err;
        }
    }); 

    if(error){
        return res.sendStatus(401);
    } else {
        userInfo = jwt.verify(token, secretKey);
    }
    delete userInfo.iat;

    try{
        const userAuthorized = await connection.query(`SELECT * FROM sessions WHERE "token"=$1 and 
                                                        "userId"=$2`, [token, parseInt(userInfo.id)]);
        if(userAuthorized.rowCount == 0){
            return res.sendStatus(401);
        } 
        const urlUser = await connection.query(`SELECT * FROM urls WHERE id=$1`, [parseInt(req.params.id)])
        if(urlUser.rowCount == 0){
            return res.sendStatus(404);
        }
        if(urlUser.rows[0].userId != userAuthorized.rows[0].userId){
            return res.sendStatus(401);
        }
        await connection.query(`DELETE FROM urls WHERE urls.id=$1`, [parseInt(req.params.id)]);
        res.sendStatus(204);

    } catch (e){
        console.log(e);
        res.status(500).send("Ocorreu um erro na rota de deleteUrl");
    }
}


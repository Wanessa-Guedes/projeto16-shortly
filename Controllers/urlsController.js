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
        
        const shortlyUrl = nanoid(8);
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
export async function getUrls(req,res){

    try{
        const urlInfo = await connection.query(`SELECT urls.id, urls."shortUrl", urls.url FROM urls 
        WHERE urls.id=$1`, [parseInt(req.params.id)]);
        if(urlInfo.rowCount == 0){
            return res.sendStatus(404);
        }
        res.status(200).send(urlInfo.rows);
    }catch (e){
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota de getUrls");
    }
}
//TODO: GET /urls/open/:shortUrl
export async function getShortUrl(req,res){

    try{
        const url = await connection.query(`SELECT urls.url FROM urls WHERE urls."shortUrl"=$1`, [req.params.shortUrl]);
        if(url.rowCount == 0){
            return res.status(404).send('URL encurtada não existe');
        }
        await connection.query(`UPDATE urls SET visualization = visualization + 1 
                                WHERE urls."shortUrl"=$1`, [req.params.shortUrl]);
        //TODO: MOSTRAR O ERRO AO TUTOR
        res.redirect(url.rows[0].url);
    } catch (e){
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota de getShortUrl"); 
    }
}
//TODO: DELETE /urls/:id
export async function deleteUrl(req,res){
    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "").trim();

    if(!token){
        return res.status(404).send(`Nenhum token enviado`);
    }

    const secretKey = process.env.JWT_SECRET;
    const userInfo = jwt.verify(token, secretKey);
    delete userInfo.iat;

    try{
        
        const userAuthorized = await connection.query(`SELECT * FROM sessions WHERE "token"=$1`, [token]);
        if(userAuthorized.rowCount == 0){
            return res.status(401).send(`Token não cadastrado`);
        } 
        const urlUser = await connection.query(`SELECT * FROM urls WHERE id=$1`, [parseInt(req.params.id)])
        if(urlUser.rowCount == 0){
            return res.status(404).send(`Url não existe`);
        }
        console.log(urlUser.rows[0].userId)
        console.log(userAuthorized.rows[0].userId)
        if(urlUser.rows[0].userId != userAuthorized.rows[0].userId){
            return res.status(401).send(`Usuário não tem permissão para deletar essa URL`);
        }
        await connection.query(`DELETE FROM urls WHERE urls.id=$1`, [parseInt(req.params.id)]);
        res.sendStatus(204);

    } catch (e){
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota de deleteUrl");
    }
}

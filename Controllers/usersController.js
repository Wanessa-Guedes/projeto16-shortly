import connection from ".././database.js";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();


export async function getUsers(req,res){

    let error = null;

    if(isNaN(req.params.id)){
        return res.sendStatus(422);
    }
    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "").trim();

    if(!token){
        return res.sendStatus(401);
    }

    const secretKey = process.env.JWT_SECRET;
    let userInfoToken = null;
    userInfoToken = jwt.verify(token, secretKey, function(err, decoded) {
        if (err){
            error = err;
        }
    }); 

    if(error){
        return res.sendStatus(401);
    } else {
        userInfoToken = jwt.verify(token, secretKey);
    }
    delete userInfoToken.iat;

    try{
        const userAuthorized = await connection.query(`SELECT * FROM sessions WHERE "token"=$1 and 
                                                        "userId"=$2`, [token, parseInt(req.params.id)]);
        if(userAuthorized.rowCount == 0){
            return res.sendStatus(401);
        }

        const isUser = await connection.query(`SELECT * FROM users WHERE id=$1`, [parseInt(userInfoToken.id)])
        if(isUser.rowCount == 0){
            return res.sendStatus(404);
        }

        const userGeneralInfo = await connection.query(`SELECT "userId" as id, name,
                                                SUM(visualization) as "visitCount"
                                                FROM users
                                                JOIN urls ON urls."userId"=users.id
                                                WHERE users.id=$1
                                                GROUP BY "userId", name`, [parseInt(req.params.id)]);

        const userInfo = await connection.query(`SELECT urls.id, 
                                                urls."shortUrl", urls.url, urls.visualization as "visitCount" 
                                                FROM urls WHERE "userId"=$1`, [parseInt(req.params.id)]);
        if(userGeneralInfo.rowCount != 0 && userInfo.rowCount != 0){
            const info = {...userGeneralInfo.rows[0], "shortenedUrls": userInfo.rows}; 
            return res.status(200).send(info);
        } else {
            const info = {id: isUser.rows[0].id, name: isUser.rows[0].name, visitCount: 0, shortenedUrls: []}; 
            res.status(200).send(info);
        }
        
    } catch(e){
        console.log(e);
        res.status(500).send("Ocorreu um erro na rota get Users");
    }
}


export async function getRank(req,res){
    try{
        const ranking = await connection.query(`SELECT users.id, users.name,
                                                COUNT(urls.id) as "linksCount",
                                                COALESCE(SUM(urls.visualization),0) as "visitCount"
                                                FROM urls
                                                RIGHT JOIN users ON urls."userId"=users.id
                                                GROUP BY users.id
                                                ORDER BY "visitCount" DESC
                                                LIMIT 10`);
        if(ranking.rowCount == 0){
            return res.status(200).send([]);
        }
        res.status(200).send(ranking.rows); 
    } catch (e){
        console.log(e);
        res.status(500).send("Ocorreu um erro na rota get Users Rank");
    }
}
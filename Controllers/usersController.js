import connection from ".././database.js";

//TODO: GET /users/:id
export async function getUsers(req,res){

    if(isNaN(req.params.id)){
        return res.status(422).send("Parametro incorreto");
    }

    try{

        const isUser = await connection.query(`SELECT * FROM users WHERE id=$1`, [parseInt(req.params.id)])
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
            const info = {...userGeneralInfo.rows, "shortenedUrls": userInfo.rows}; 
            return res.status(200).send(info);
        } else {
            const info = {id: isUser.rows[0].id, name: isUser.rows[0].name, visitCount: 0, shortenedUrls: []}; 
            res.status(200).send(info);
        }
        
    } catch(e){
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota get Users");
    }
}

//TODO: GET /users/ranking

export async function getRank(req,res){
    try{
        const ranking = await connection.query(`SELECT "userId" as id, name,
                                                COUNT(url) as "linksCount",
                                                SUM(visualization) as "visitCount"
                                                FROM users
                                                JOIN urls ON urls."userId"=users.id
                                                GROUP BY "userId", name
                                                ORDER BY "visitCount" DESC
                                                LIMIT 10`);
        if(ranking.rowCount == 0){
            return res.status(200).send([]);
        }
        res.status(200).send(ranking.rows); 
    } catch (e){
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota get Users Rank");
    }
}
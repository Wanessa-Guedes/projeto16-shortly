import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

import connection from ".././database.js";

export async function postSignUp(req,res) {

    const passwordHash = bcrypt.hashSync(req.body.password, 10);
    try{
        const alreadUser = await connection.query(`SELECT * FROM users WHERE email=$1`, [req.body.email]);
        if(alreadUser.rowCount !== 0){
            return res.status(422).send("Ocorreu um erro! usuário já cadastrado");
        }
        await connection.query(`INSERT INTO users (name, email, password)
                                                VALUES ($1, $2, $3)`, [req.body.name, req.body.email, passwordHash]);
        //console.log("Usuários do banco", users.rows);
        res.sendStatus(201);
    } catch (e) {
        console.log(e);
        res.status(422).send("Ocorreu um erro ao obter os usuários");
    }
}

export async function postSignIn(req,res) {
    
    try{
        const  users = await connection.query(`SELECT users.email, users.password FROM users WHERE email=$1`, [req.body.email]);
        console.log("Usuários do banco", users.rowCount);
        if(users.rowCount == 0){
            return res.status(401).send("Usuário não cadastrado");
        }

        if(bcrypt.compareSync(req.body.password, users.rows[0].password)){
            const token = uuid();
            //TODO: COLOCAR ISSO NA TABELA DE SESSÃO
            console.log(token)
            return res.status(200).send(`Usuário cadastrado. Entra aew, ${req.body.email}`)
        }

        res.status(401).send("Usuário não cadastrado");

    } catch (e) {
        console.log(e);
        res.status(422).send("Ocorreu um erro na rota de sign in");
    }
}
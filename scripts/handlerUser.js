"use strict";

const mysql = require("mysql2/promise");
const options = require("./options.json");
// Reutilizar as mesmas conexões ao inves de tar sempre a começar outra
const connection = mysql.createPool(options);

const login = async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return res.status(400).json({ message: "Email e password sao obrigatorios." });
    }

    try {
        //isto faz com que as credenciais nao sejam parte do codigo SQL (proteção contra injections)
        const [users] = await connection.execute(
            "SELECT user_id, user_email FROM `user` WHERE user_email = ? AND user_password = ?",
            [email.trim(), password],
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "parametros invalidos." });
        }

        // Rodar o ID da sessão depois de autenticar para evitar a persistencia da sessão.
        await new Promise((resolve, reject) => {
            req.session.regenerate((error) => error ? reject(error) : resolve());
        });

        req.session.userId = users[0].user_id;
        req.session.email = users[0].user_email;
        await new Promise((resolve, reject) => {
            req.session.save((error) => error ? reject(error) : resolve());
        });

        return res.json({ message: "Login sucedido." });

    } catch (error) {
        console.error("Login request failed:", error);
        return res.status(500).json({ message: "Erro 500 (internal server error - erro do servidor), tente denovo mais tarde." });
    }
}
module.exports.login = login;

const register = async (req, res) => {
    const { email, password, name, surname } = req.body ?? {};
    // obrigar o user a cumprir as regras dos valores da bd. com os limites
    if (
        typeof email !== "string" || !email.trim() || email.trim().length > 255 ||
        typeof password !== "string" || password.length < 8 || password.length > 255 ||
        typeof name !== "string" || !name.trim() || name.trim().length > 30 ||
        typeof surname !== "string" || !surname.trim() || surname.trim().length > 30
    ) {
        return res.status(400).json({ message: "Introduza valores validos, uma password de 8 carateres é obrigatoria." });
    }

    try {
        // Usar parametros limitados para todos os valores fornecidos pelo utilizador.
        await connection.execute(
            "INSERT INTO `user` (user_email, user_password, user_nome, user_sobrenome) VALUES (?, ?, ?, ?)",
            [email.trim(), password, name.trim(), surname.trim()],
        );
        return res.status(201).json({ message: "Conta criada." });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Uma conta com esse email já existe." });
        }
        console.error("Registration request failed:", error);
        return res.status(500).json({ message: "Erro 500 (internal server error - erro do servidor), tente denovo mais tarde." });
    }
}
module.exports.register = register; 

const deleteUser = async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
        return res.status(401).json({ message: "Faça login para eliminar a conta." });
    }

    try {
        // Apaga a conta que está autenticada.
        const [result] = await connection.execute(
            "DELETE FROM `user` WHERE user_id = ?",
            [userId],   //Desestruturação do array. se nao for assim, o result estaria undefined.
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "A conta não foi encontrada." });
        }

        // Dar logout ao user apos ele apagar a conta.
        await new Promise((resolve, reject) => {
            req.session.destroy((error) => error ? reject(error) : resolve());
        });

        res.clearCookie("connect.sid");     // connect.sid é o ID da sessão do utilizador. a linha serve para dar clear a essa cookie
        return res.json({ message: "Conta apagada." });
    } catch (error) {
        console.error("Account deletion request failed:", error);
        return res.status(500).json({ message: "Erro 500 (erro do servidor), tente novamente mais tarde." });
    }
}
module.exports.deleteUser = deleteUser;

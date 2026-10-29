"use strict";

const mysql = require("mysql2/promise");
const options = require("../config/app.config.json");

class AuthController {
    constructor() {
        this.database = mysql.createPool(options.database);
        this.emailRegEx = new RegExp(options.RegEx.email);
        this.nameRegEx = new RegExp(options.RegEx.names);

        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    async register(req, res) {
        const { email, password, firstName, lastName } = req.body ?? {};

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: "É necessário preencher todos os dados." });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!this.emailRegEx.test(cleanEmail)) {
            return res.status(400).json({ error: "Endereço de email inválido." });
        }

        if (typeof password !== "string" || password.length === 0 || password.length > 128) {
            return res.status(400).json({ error: "Credenciais inválidas." });
        }

        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();

        if (!this.nameRegEx.test(cleanFirstName) || !this.nameRegEx.test(cleanLastName)) {
            return res.status(400).json({ error: "O nome contém caracteres inválidos." });
        }

        try {
            const [existingUsers] = await this.database.execute(
                "SELECT user_id FROM users WHERE user_email = ?",
                [cleanEmail]
            );

            if (existingUsers.length > 0) {
                return res.status(401).json({ error: "Utilizador já existente." });
            }

            const [insertResult] = await this.database.execute(
                "INSERT INTO users (user_email, user_password, user_nome, user_sobrenome) VALUES (?, ?, ?, ?)",
                [cleanEmail, password, cleanFirstName, cleanLastName]
            );

            req.session.userId = insertResult.insertId;
            return res.status(200).json({ message: "Registo efetuado com sucesso." });

        } catch (error) {
            console.error("Erro no registo:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    async login(req, res) {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({ error: "Email e palavra-passe são obrigatórios." });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!this.emailRegEx.test(cleanEmail)) {
            return res.status(400).json({ error: "Endereço de email inválido." });
        }

        if (typeof password !== "string" || password.length === 0 || password.length > 128) {
            return res.status(400).json({ error: "Credenciais inválidas." });
        }

        try {
            const [users] = await this.database.execute(
                "SELECT user_id, password FROM users WHERE user_email = ?",
                [cleanEmail]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: "Credenciais inválidas." });
            }

            const activeUser = users[0];

            if (password !== activeUser.password) {
                return res.status(401).json({ error: "Credenciais inválidas." });
            }

            req.session.userId = activeUser.user_id;
            return res.status(200).json({ message: "Login efetuado com sucesso." });

        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao encerrar a sessão." });
            }

            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "Logout efetuado com sucesso." });
        });
    }
}

module.exports = AuthController;
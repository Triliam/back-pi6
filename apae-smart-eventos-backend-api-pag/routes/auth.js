const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
// Usando require() para carregar o dotenv, compatível com CommonJS
require('dotenv').config(); 

// Assume que db e httpStatusesCodes também são CommonJS
const db = require('../db/db');
const httpStatus = require('../constants/httpStatusesCodes');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password || !req.body.name) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Bad Request: Missing info' });
        }

        const [rows] = await db.query('SELECT 1 FROM users WHERE email = ?', [req.body.email]);
        if (rows.length > 0) {
            return res.status(httpStatus.CONFLICT).json({ message: 'This email is already in use.' });
        }

        // --- ADICIONA O HASH DA SENHA ---
        // Gerar o hash da senha
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // O '10' é o saltRounds

        const [result] = await db.execute(
            'INSERT INTO users (email, password, name, user_type) VALUES (?, ?, ? ,?)',
            [req.body.email, hashedPassword, req.body.name, 'associate'] // Usar a senha hasheada aqui
        );


        const user = {
            id: result.insertId,
            type: 'associate',
        };
        const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(httpStatus.CREATED).json({ user, accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ message: 'Você precisa informar e-mail e senha.' }); // Mensagem mais amigável
        }

        // 1. Buscar o usuário APENAS pelo e-mail
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
            req.body.email,
        ]);

        // 2. Verificar se o usuário existe
        if (rows.length === 0) {

            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'E-mail ou senha inválidos.' });
        }

        const user = rows[0]; // O usuário encontrado

        // 3. Comparar a senha fornecida com o hash armazenado no banco de dados
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Se a senha for válida, prosseguir com a geração de tokens
        const userPayload = {
            id: user.id,
            type: user.user_type, // Use user.user_type, que é o campo do banco
        };
        const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Remover a senha do objeto do usuário antes de enviar na resposta por segurança
        delete user.password;

        res.json({ user, accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro interno do servidor.' });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        if (!req.body.refreshToken) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ message: 'Your must sent the refresh token.' });
        }

        const tokenVerification = jwt.verify(
            req.body.refreshToken,
            process.env.JWT_SECRET,
            (error, decodedToken) => {
                if (error) {
                    return { isTokenValid: false, message: 'Invalid or expired refresh token.' };
                }
                return { isTokenValid: true, decodedToken: decodedToken };
            }
        );
        if (!tokenVerification.isTokenValid) {
            return res.status(httpStatus.FORBIDDEN).json({ message: tokenVerification.message });
        }
        const user = {
            id: tokenVerification.decodedToken.id,
            type: tokenVerification.decodedToken.type,
        };
        const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
});

// Correção: Usar module.exports para ser compatível com o require() em app.js
module.exports = router;

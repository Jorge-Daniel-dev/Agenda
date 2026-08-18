import dotenv from "dotenv";

dotenv.config();

console.log("JWT_SECRET =", process.env.JWT_SECRET);

import pool from '../db/database.js'
import cors from 'cors'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://agenda-lilac-omega.vercel.app' // sin "/" al final
}))

const JWT_SECRET = process.env.JWT_SECRET 

function autenticar(req, res, next) {
    const authHeader = req.headers.authorization 
    if (!authHeader) {
        return res.status(401).json({ mensaje: 'No autorizado' })
    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.usuario = payload 
        next()
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' })
    }
}

app.post('/Forms', async (req, res) => {
    try {
        const { user_name, user_password, user_email, rol } = req.body

        const hash = await bcrypt.hash(user_password, 10)

        const result = await pool.query(
            `INSERT INTO users (user_name, user_password, user_email, rol) VALUES($1,$2,$3,$4) RETURNING id, user_name, user_email, rol`,
            [user_name, hash, user_email, rol]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Error al enviar' })
        }

        res.json({ mensaje: 'Datos correctos', usuario: result.rows[0] })

    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

app.post('/', async (req, res) => {
    try {
        const { user_email, user_password } = req.body

        const result = await pool.query(
            `SELECT * FROM users WHERE user_email = $1`,
            [user_email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Error' })
        }

        const usuario = result.rows[0]
        const passwordOk = await bcrypt.compare(user_password, usuario.user_password)

        if (!passwordOk) {
            return res.status(401).json({ mensaje: 'Error' })
        }

        const token = jwt.sign(
            { id: usuario.id, user_email: usuario.user_email, rol: usuario.rol, user_name: usuario.user_name },
            JWT_SECRET,
            { expiresIn: '2h' }
        )

        res.json({ mensaje: 'Todo bien', token })

    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

app.post('/consultas', autenticar, async (req, res) => {
    try {
        const { titulo, contenido } = req.body
        const { id: userId } = req.usuario

        const result = await pool.query(
            `INSERT INTO consultas (user_id, titulo, contenido) VALUES ($1, $2, $3) RETURNING *`,
            [userId, titulo, contenido]
        )

        res.status(201).json(result.rows[0])

    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

app.get('/consultas', autenticar, async (req, res) => {
    try {
        const { id: userId } = req.usuario

        const result = await pool.query(
            `SELECT * FROM consultas WHERE user_id = $1 ORDER BY creado_en DESC`,
            [userId]
        )

        res.json(result.rows)

    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

// ---------- EVENTOS ----------

// Listar TODOS los eventos, con el nombre de quién lo creó
app.get('/eventos', autenticar, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT eventos.*, users.user_name 
             FROM eventos 
             JOIN users ON eventos.user_id = users.id 
             ORDER BY dia, hora`
        )
        res.json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

// Crear evento (se guarda quién lo creó, pero lo ven todos)
app.post('/eventos', autenticar, async (req, res) => {
    try {
        const { id: userId, user_name } = req.usuario
        const { titulo, dia, hora, categoria, nota } = req.body

        const result = await pool.query(
            `INSERT INTO eventos (user_id, titulo, dia, hora, categoria, nota)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, titulo, dia, hora, categoria, nota]
        )
        res.status(201).json({ ...result.rows[0], user_name })
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

// Eliminar evento (cualquier usuario logueado puede borrar cualquier evento)
app.delete('/eventos/:id', autenticar, async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            `DELETE FROM eventos WHERE id = $1 RETURNING *`,
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Evento no encontrado' })
        }
        res.json({ mensaje: 'Eliminado' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

// ---------- NOTAS ----------

// Listar TODAS las notas, con el nombre de quién la creó
app.get('/notas', autenticar, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT notas.*, users.user_name 
             FROM notas 
             JOIN users ON notas.user_id = users.id 
             ORDER BY notas.creado_en DESC`
        )
        res.json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

// Crear nota (se guarda quién la creó, pero la ven todos)
app.post('/notas', autenticar, async (req, res) => {
    try {
        const { id: userId, user_name } = req.usuario
        const { texto, color } = req.body

        const result = await pool.query(
            `INSERT INTO notas (user_id, texto, color) VALUES ($1, $2, $3) RETURNING *`,
            [userId, texto, color]
        )
        res.status(201).json({ ...result.rows[0], user_name })
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

// Eliminar nota (cualquier usuario logueado puede borrar cualquier nota)
app.delete('/notas/:id', autenticar, async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            `DELETE FROM notas WHERE id = $1 RETURNING *`,
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Nota no encontrada' })
        }
        res.json({ mensaje: 'Eliminada' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error en el servidor' })
    }
})

app.listen(3000, () => {
    console.log('hola')
})
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import env from "dotenv";

env.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    connectionString: process.env.PG_URL,
});
db.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "financas",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

app.use(cors());

app.get("/", (req, res) => {
    return res.render("login.ejs");
});

app.get("/register", (req, res) => {
    return res.render("register.ejs");
});

app.get("/home", async (req, res) => {
    if (!req.session.user) return res.redirect("/");

    const result = await db.query(
        "SELECT * FROM fttabela WHERE user_id = $1 ORDER BY data DESC",
        [req.session.user.id]
    );
    const data = result.rows;

    const months = data.map((el) => el.data.getMonth()).sort((a, b) => a - b);
    const allMonths = new Set(months);

    const years = data.map((el) => el.data.getFullYear()).sort((a, b) => a - b);
    const allYears = new Set(years);

    console.log(allYears);

    const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    res.render("home.ejs", { data: data, allMonths, monthNames, allYears });
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const result = await db.query("SELECT * FROM ftuser WHERE username = $1", [
        username,
    ]);
    const data = result.rows[0];

    console.log(data);

    if (!data) return res.redirect("/");

    if (data.password == password) {
        req.session.user = data;
        return res.redirect("/home");
    }
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const passwordC = req.body.passwordC;
    const name = req.body.name;

    const result = await db.query(
        "SELECT username FROM ftuser WHERE username = $1",
        [username]
    );
    const exist = result.rows.length;
    console.log(exist);

    if (!exist) {
        const newUser = await db.query(
            "INSERT INTO ftuser (username, password, nome) VALUES($1,$2,$3) RETURNING *",
            [username, password, name]
        );

        req.session.user = newUser.rows[0];

        return res.redirect("/home");
    } else {
        return res.redirect("/");
    }
});

app.post("/add", async (req, res) => {
    const tipo = req.body.tipo;
    const valor = req.body.valor;
    const categoria = req.body.categoria;
    const data =
        req.body.data ||
        `${new Date().getFullYear()}-${
            new Date().getMonth() + 1
        }-${new Date().getDate()}`;

    console.log(data);

    db.query(
        "INSERT INTO fttabela (tipo, valor,categoria,data, user_id) VALUES($1,$2,$3,$4,$5)",
        [
            tipo.trim(),
            valor.trim(),
            categoria.trim(),
            data.trim(),
            req.session.user.id,
        ]
    );

    const result = await db.query(
        "SELECT * FROM fttabela WHERE user_id = $1 ORDER BY data DESC",
        [req.session.user.id]
    );
    const data1 = result.rows;

    res.json(data1);
});

app.post("/deletar", (req, res) => {
    db.query("DELETE FROM fttabela WHERE id = $1", [req.body.idAtual]);
    res.json("DELETADO");
});

app.get("/editar", async (req, res) => {
    const idAtual = Number(req.query.idAtual);

    const result = await db.query("SELECT * FROM fttabela WHERE id = $1", [
        idAtual,
    ]);
    const data = result.rows[0];

    const tipoEd = req.query.tipoEd || data.tipo;
    const valorEd = req.query.valorEd || data.valor;
    const categoriaEd = req.query.categoriaEd || data.categoria;
    const dataEd = req.query.dataEd || data.data;

    const result1 = await db.query(
        "UPDATE fttabela SET tipo = $1, valor = $2, categoria = $3, data = $4 WHERE id = $5 RETURNING *",
        [tipoEd, valorEd, categoriaEd, dataEd, idAtual]
    );

    const data1 = result1.rows[0];

    res.json(data1);
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        return res.redirect("/");
    });
});

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});

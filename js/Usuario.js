const db = require("./db");

async function verificaEmail(email) {
    const conn = await db.connectBD();

    const sqlVerificaEmail = 'SELECT U.codIntUsuario AS id FROM usuario AS U WHERE U.email = ?;';
    const vEmail = [email];

    const [rows] = await conn.query(sqlVerificaEmail, vEmail);

    return rows.length > 0 ? rows : false;
};

async function verificaCPF(cpf) {
    const conn = await db.connectBD();

    const sqlVerificaCPF = 'SELECT U.codIntUsuario AS id FROM usuario AS U WHERE U.cpf = ?;';
    const vCPF = [cpf];

    const [rows] = await conn.query(sqlVerificaCPF, vCPF);

    return rows.length > 0 ? rows : false;
};

async function novo(user) {
    const conn = await db.connectBD();
    const sql = 'INSERT INTO usuario(cpf, email, senha, nome, foto, cep, logradouro, numero, bairro, cidade, uf, pais, complemento, telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    const values = [user.cpf, user.email, user.senha, user.nome, user.foto, user.cep, user.logradouro, user.numero, user.bairro, user.cidade, user.uf, user.pais, user.complemento, user.telefone];
    await conn.query(sql, values);    
};

async function carregaDados(email) {
    const conn = await db.connectBD();
    const sql = `
        SELECT U.codIntUsuario AS id, U.cpf, U.email, U.senha, U.nome, U.foto, U.cep, U.logradouro, U.numero, U.bairro, U.cidade, U.uf, U.pais, U.complemento, U.telefone
        FROM usuario AS U
        WHERE U.email = ?;
    `;
    const values = [email];
    const [rows] = await conn.query(sql, values);
    return rows;
};

async function login(email, senha) {
    const conn = await db.connectBD();
    const sql = 'SELECT * FROM usuario WHERE email = ? AND senha = ?;';
    const values = [email, senha];

    const [rows] = await conn.query(sql, values);

    return rows.length > 0 ? rows : false;
};

async function atualizarUsuario(id, novosDados) {
    const conn = await db.connectBD();
    const sql = `
        UPDATE usuario AS U
        SET U.cpf = ?, U.email = ?, U.senha = ?, U.nome = ?, U.foto = ?, U.cep = ?, U.logradouro = ?, U.numero = ?, U.bairro = ?, U.cidade = ?, U.uf = ?, U.pais = ?, U.complemento = ?, U.telefone = ?
        WHERE U.codIntUsuario = ?;
    `;
    const values = [novosDados.cpf, novosDados.email, novosDados.senha, novosDados.nome, novosDados.foto, novosDados.cep, novosDados.logradouro, novosDados.numero, novosDados.bairro, novosDados.cidade, novosDados.uf, novosDados.pais, novosDados.complemento, novosDados.telefone, id];
    await conn.query(sql, values);
};

async function deletarUsuario(id) {
    const conn = await db.connectBD();
    const sql = 'DELETE FROM usuario AS U WHERE U.codIntUsuario = ?;';
    const values = [id];

    await conn.query(sql, values);
};

module.exports = { novo, carregaDados, login, atualizarUsuario, deletarUsuario, verificaEmail, verificaCPF };
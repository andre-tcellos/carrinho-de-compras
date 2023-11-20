const db = require("./db");

async function verificaEmail(email) {
    const conn = await db.connectBD();

    const sqlVerificaEmail = 'SELECT M.codIntMercado AS id FROM mercado AS M WHERE M.email = ?;';
    const vEmail = [email];

    const [rows] = await conn.query(sqlVerificaEmail, vEmail);

    return rows.length > 0 ? rows : false;
};

async function verificaUsuario(email) {
    const conn = await db.connectBD();

    const sqlVerificaEmail = 'SELECT M.codIntMercado AS id FROM mercado AS M WHERE M.usuario = ?;';
    const vEmail = [email];

    const [rows] = await conn.query(sqlVerificaEmail, vEmail);

    return rows.length > 0 ? rows : false;
};

async function verificaCNPJ(cnpj) {
    const conn = await db.connectBD();

    const sqlVerificaCNPJ = 'SELECT M.codIntMercado AS id FROM mercado AS M WHERE M.cnpj = ?;';
    const vCNPJ = [cnpj];

    const [rows] = await conn.query(sqlVerificaCNPJ, vCNPJ);

    return rows.length > 0 ? rows : false;
};

async function novo(mercado) {
    const conn = await db.connectBD();

    const sql = 'INSERT INTO mercado(cnpj, nome, email, telefone, cep, logradouro, numero, bairro, cidade, uf, pais, complemento, usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    const values = [mercado.cnpj, mercado.nome, mercado.email, mercado.telefone, mercado.cep, mercado.logradouro, mercado.numero, mercado.bairro, mercado.cidade, mercado.uf, mercado.pais, mercado.complemento, mercado.usuario];

    await conn.query(sql, values);    
};

async function carregaDados(email) {
    const conn = await db.connectBD();

    const sql = `
        SELECT M.codIntMercado AS id, M.cnpj, M.nome, M.email, M.telefone, M.cep, M.logradouro, M.numero, M.bairro, M.cidade, M.uf, M.pais, M.complemento, M.usuario
        FROM mercado AS M
        WHERE M.usuario = ?;
    `;
    const values = [email];
    const [rows] = await conn.query(sql, values);

    return rows;
};

async function atualizarMercado(id, novosDados) {
    const conn = await db.connectBD();

    const sql = `
        UPDATE mercado AS M
        SET M.cnpj = ?, M.nome = ?, M.email = ?, M.telefone = ?, M.cep = ?, M.logradouro = ?, M.numero = ?, M.bairro = ?, M.cidade = ?, M.uf = ?, M.pais = ?, M.complemento = ?
        WHERE M.codIntMercado = ?;
    `;
    const values = [novosDados.cnpj, novosDados.nome, novosDados.email, novosDados.telefone, novosDados.cep, novosDados.logradouro, novosDados.numero, novosDados.bairro, novosDados.cidade, novosDados.uf, novosDados.pais, novosDados.complemento, id];

    await conn.query(sql, values);
};

async function deletarMercado(id) {
    const conn = await db.connectBD();

    const sql = 'DELETE FROM mercado AS M WHERE M.codIntMercado = ?;';
    const values = [id];

    await conn.query(sql, values);
};

module.exports = { novo, carregaDados, atualizarMercado, deletarMercado, verificaEmail, verificaUsuario, verificaCNPJ };
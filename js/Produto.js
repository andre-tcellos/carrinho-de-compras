const db = require("./db");

async function carregaProdutos(mercadoID) {
    const conn = await db.connectBD();

    const sql = `
        SELECT P.codIntProduto AS id, P.codIntMercado AS mercadoID, P.nome, P.descricao, P.categoria, P.marca, P.unidadeMedida, REPLACE(P.medida, '.', ',') AS medida, P.lote, DATE_FORMAT(P.dataFabricacao,'%d/%m/%Y') AS dataFabricacao, DATE_FORMAT(P.dataValidade,'%d/%m/%Y') AS dataValidade, REPLACE(P.preco, '.', ',') AS preco, P.foto
        FROM produto AS P
        WHERE P.codIntMercado = ?;
    `;
    const values = [mercadoID];
    const [rows] = await conn.query(sql, values);

    return rows;
};

async function deletarProduto(id) {
    const conn = await db.connectBD();

    const sql = 'DELETE FROM produto AS P WHERE P.codIntProduto = ?;';
    const values = [id];

    await conn.query(sql, values);
};

async function dadosDoProduto(id) {
    const conn = await db.connectBD();
    
    const sql = `
    SELECT P.codIntProduto AS id, P.codIntMercado AS mercadoID, P.nome, P.descricao, P.categoria, P.marca, P.unidadeMedida, P.medida, P.lote, DATE_FORMAT(P.dataFabricacao,'%Y-%m-%d') AS dataFabricacao, DATE_FORMAT(P.dataValidade,'%Y-%m-%d') AS dataValidade, P.preco, P.foto
        FROM produto AS P
        WHERE P.codIntProduto = ?;
    `;
    const values = [id];
    const [rows] = await conn.query(sql, values);

    return rows;
};

async function atualizarProduto(novosDados) {
    const conn = await db.connectBD();

    const sql = `
        UPDATE produto AS P
        SET P.nome = ?, P.descricao = ?, P.marca = ?, P.unidadeMedida = ?, P.medida = ?, P.lote = ?, P.dataFabricacao = ?, P.dataValidade = ?, P.preco = ?, P.foto = ?, P.categoria = ?
        WHERE P.codIntProduto = ?;
    `;
    const values = [novosDados.nome, novosDados.descricao, novosDados.marca, novosDados.unidadeMedida, novosDados.medida, novosDados.lote, novosDados.dataFabricacao, novosDados.dataValidade, novosDados.preco, novosDados.foto, novosDados.categoria, novosDados.codIntProduto];

    await conn.query(sql, values);
};

async function cadastrarProduto(novosDados) {
    const conn = await db.connectBD();

    const sql = `INSERT INTO Produto(codIntMercado, nome, descricao, marca, unidadeMedida, medida, lote, dataFabricacao, dataValidade, preco, foto, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const values = [novosDados.codIntMercado, novosDados.nome, novosDados.descricao, novosDados.marca, novosDados.unidadeMedida, novosDados.medida, novosDados.lote, novosDados.dataFabricacao, novosDados.dataValidade, novosDados.preco, novosDados.foto, novosDados.categoria];

    await conn.query(sql, values);
};

module.exports = { carregaProdutos, deletarProduto, dadosDoProduto, atualizarProduto, cadastrarProduto };
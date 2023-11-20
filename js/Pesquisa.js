const db = require("./db");

async function pesquisaRapida(texto) {
    const conn = await db.connectBD();

    const sql = `
        SELECT M.nome AS mercado, P.nome, P.descricao, P.categoria, P.marca, P.unidadeMedida, REPLACE(P.medida, '.', ',') AS medida, P.lote, DATE_FORMAT(P.dataFabricacao,'%d/%m/%Y') AS dataFabricacao, DATE_FORMAT(P.dataValidade,'%d/%m/%Y') AS dataValidade, REPLACE(P.preco, '.', ',') AS preco, P.foto
        FROM produto AS P
        INNER JOIN mercado AS M ON P.codIntMercado = M.codIntMercado
        WHERE (P.nome LIKE REPLACE("%?%", "'", "") OR P.descricao LIKE REPLACE("%?%", "'", ""))
        ORDER BY P.preco ASC;
    `;
    const values = [texto, texto];
    const [rows] = await conn.query(sql, values);

    return rows;
};

module.exports = { pesquisaRapida };
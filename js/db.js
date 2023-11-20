async function connectBD() {
    // Se já está conectado (em variável Globalmente), então não precisa conectar novamente
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;

    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({ host:'localhost', database: 'carrinho_de_compras', user: 'root', password: '12345'});

    // Guarda a conexão em uma variável Global
    global.connection = connection;
    return connection;
}

connectBD();

module.exports = { connectBD };

/*
async function selectUsers() {
    const conn = await connect();
    const [rows] = await conn.query('SELECT * FROM usuario;');
    return rows;
}

async function insertUser(user) {
    const conn = await connect();
    const sql = 'INSERT INTO usuario(cpf, email, senha, nome) VALUES (?, ?, ?, ?);';
    const values = [user.cpf, user.email, user.senha, user.nome];
    await conn.query(sql, values);
}

async function updateUser(id, user) {
    const conn = await connect();
    const sql = 'UPDATE usuarios SET nome=?, email=? WHERE codIntUsuario=?;'
    const values = [user.nome, user.email, id];
    await conn.query(sql, values);
}

async function deleteUsuario(id) {
    const conn = await connect();
    const sql = 'DELETE FROM usuarios WHERE codIntUsuario=?;';
    return await conn.query(sql, [id]);
}
*/
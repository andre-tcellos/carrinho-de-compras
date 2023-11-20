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
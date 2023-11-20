# carrinho-de-compras
Trabalho de Conclusão de Curso: Aplicação Web para Comparar Preços de Produtos entre Mercados

## Para Executar a Aplicação
```
nodemon index
```

## Tabelas do Banco de Dados
```
CREATE TABLE Usuario (codIntUsuario INTEGER PRIMARY KEY auto_increment, cpf VARCHAR(14) NOT NULL, email VARCHAR(50) NOT NULL, senha VARCHAR(50) NOT NULL, nome VARCHAR(50) NOT NULL, foto VARCHAR(50), telefone VARCHAR(15) NOT NULL, cep VARCHAR(9), logradouro VARCHAR(50) NOT NULL, numero VARCHAR(5), bairro VARCHAR(20) NOT NULL, cidade VARCHAR(20) NOT NULL, uf VARCHAR(2) NOT NULL, pais VARCHAR(20) NOT NULL, complemento VARCHAR(50));
CREATE TABLE Mercado (codIntMercado INTEGER PRIMARY KEY auto_increment, codIntUsuario INTEGER NOT NULL, cnpj VARCHAR(19) NOT NULL, nome VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, telefone VARCHAR(15) NOT NULL, cep VARCHAR(9), logradouro VARCHAR(50) NOT NULL, numero VARCHAR(5), bairro VARCHAR(20) NOT NULL, cidade VARCHAR(20) NOT NULL, uf VARCHAR(2) NOT NULL, pais VARCHAR(20) NOT NULL, complemento VARCHAR(50));
CREATE TABLE Produto (codIntProduto INTEGER PRIMARY KEY auto_increment, codIntMercado INTEGER NOT NULL, nome VARCHAR(50) NOT NULL, descricao VARCHAR(50) NOT NULL, marca VARCHAR(50) NOT NULL, unidadeMedida VARCHAR(10) NOT NULL, medida DECIMAL(10,2) NOT NULL, lote VARCHAR(10) NOT NULL, dataFabricacao DATE NOT NULL, dataValidade DATE NOT NULL, preco DECIMAL(10,2) NOT NULL, foto VARCHAR(50) NOT NULL, categoria VARCHAR(50) NOT NULL);
```
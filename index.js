const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');

// Bancos de Dados
const Usuario = require("./js/Usuario");
const Mercado = require("./js/Mercado");
const Produto = require("./js/Produto");
const Pesquisa = require("./js/Pesquisa");

// Template Engine
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CSS e Imagens
app.use(express.static(__dirname + '/public'));

// Session que vai verificar os usuários logados
app.use(session({ secret: '8av4737vt785nvdhf8' }));

// Rotas
app.get("/", function(req, res) {
    if(req.session.login) {
        res.redirect('usuario');
    } else {
        res.render('index');
    };
});

app.post("/login", function(req, res) {
    // Salva os Inputs
    let email = req.body.emailLogin;
    let senha = req.body.senhaLogin;
    
    // Verifica se os campos 'existem' e não estão vazios
    if (email) {
        if (senha) {
            // Executa a chamada no banco de dados
            (async () => {
                let usuario = await Usuario.login(email, senha);
    
                if (!usuario) {
                    res.render('index', { mensagemDeErroLogin: "E-mail ou Senha inválidos.", login: { email: email, senha: senha }, focaLogin: true });
                } else {
                    req.session.login = email;
                    res.redirect('usuario');
                };
            })();
        } else {
            res.render('index', { mensagemDeErroLogin: "A Senha é Obrigatória e precisa ser preenchida.", login: { email: email, senha: senha }, focaLogin: true });
        };
    } else {
        res.render('index', { mensagemDeErroLogin: "O campo E-mail é Obrigatório e precisa ser preenchido.", login: { email: email, senha: senha }, focaLogin: true });
    };
});

app.get("/usuario", function(req, res) {
    if(!req.session.login) {
        res.redirect('/');
    } else {
        // Se ele já carregou anteriormente o Usuário, então ele carrega a página com as informações guardadas, dessa forma evita pesquisar novamente no Banco de Dados.
        if(global.usuario && global.usuario !== '') {
            res.render('usuario', { usuario: global.usuario });
        } else {
            (async () => {
                let [usuario] = await Usuario.carregaDados(req.session.login);
                global.usuario = usuario;
                res.render('usuario', { usuario: usuario });
            })();
        };
    };
});

app.post("/atualizar", function(req, res) {
    let inputValue = req.body.atualizar;

    if (inputValue == "liberar") {
        // Se ele já carregou anteriormente o Usuário, então ele carrega a página com as informações guardadas, dessa forma evita pesquisar novamente no Banco de Dados.
        if(global.usuario && global.usuario !== '') {
            res.render('usuario', { usuario: global.usuario, atualizarDados: true });
        } else {
            (async () => {
                let [usuario] = await Usuario.carregaDados(req.session.login);
                global.usuario = usuario;
                res.render('usuario', { usuario: usuario, atualizarDados: true });
            })();
        };
    } else if (inputValue == "confirmar") {
        let novosDados = {
            cpf: req.body.cpfNovo,
            email: req.body.emailNovo,
            senha: req.body.senhaNovo,
            nome: req.body.nomeNovo,
            foto: req.body.fotoNovo,
            cep: req.body.cepNovo,
            logradouro: req.body.logradouroNovo,
            numero: req.body.numeroNovo,
            bairro: req.body.bairroNovo,
            cidade: req.body.cidadeNovo,
            uf: req.body.ufNovo,
            pais: req.body.paisNovo,
            complemento: req.body.complementoNovo,
            telefone: req.body.telefoneNovo,
        };

        // Verifica os campos Obrigatórios
        if (novosDados.cpf == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O CPF é obrigatório.", atualizarDados: true });
        } else if (novosDados.email == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O E-mail é obrigatório.", atualizarDados: true });
        } else if (novosDados.senha == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "A Senha é obrigatória.", atualizarDados: true });
        } else if (novosDados.nome == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O Nome é obrigatório.", atualizarDados: true });
        } else if (novosDados.logradouro == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O Logradouro é obrigatório.", atualizarDados: true });
        } else if (novosDados.bairro == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O Bairro é obrigatório.", atualizarDados: true });
        } else if (novosDados.cidade == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "A Cidade é obrigatório.", atualizarDados: true });
        } else if (novosDados.uf == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O UF é obrigatório.", atualizarDados: true });
        } else if (novosDados.pais == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O País é obrigatório.", atualizarDados: true });
        } else if (novosDados.telefone == '') {
            res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "O Telefone é obrigatório.", atualizarDados: true });
        } else {
            // Verifica se CPF ou E-mail já existem no sistema
            (async () => {
                let cpfExistente = await Usuario.verificaCPF(novosDados.cpf);
                let emailExistente = await Usuario.verificaEmail(novosDados.email);
    
                if (cpfExistente != false && novosDados.cpf != global.usuario.cpf) {
                    res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "CPF já cadastrado no sistema.", atualizarDados: true });
                } else if (emailExistente != false && novosDados.email != global.usuario.email) {
                    res.render('usuario', { usuario: novosDados, mensagemDeErroAtualizar: "E-mail já cadastrado no sistema.", atualizarDados: true });
                } else {
                    // Atualiza o Usuário no Sistema
                    await Usuario.atualizarUsuario(global.usuario.id, novosDados);
                    global.usuario = '';
                    req.session.login = '';
                    res.render('index', { focaLogin: true, login: { email: novosDados.email, senha: novosDados.senha } });
                };
            })();
        };
    } else if (inputValue == "deletar") {
        (async () => {
            await Usuario.deletarUsuario(global.usuario.id);
            global.usuario = '';
            req.session.login = '';
            res.render('index');
        })();
    } else {
        res.redirect('usuario');
    };
});

app.post("/atualizarMercado", function(req, res) {
    let inputValue = req.body.atualizar;

    if (inputValue == "liberar") {
        // Se ele já carregou anteriormente o Mercado, então ele carrega a página com as informações guardadas, dessa forma evita pesquisar novamente no Banco de Dados.
        if(global.mercado && global.mercado !== '') {
            res.render('mercado', { mercado: global.mercado, atualizarDados: true, mostrarBtnProdutos: true });
        } else {
            (async () => {
                let [mercado] = await Mercado.carregaDados(req.session.login);
                global.mercado = mercado;
                res.render('mercado', { mercado: mercado, atualizarDados: true, mostrarBtnProdutos: global.mercado && global.mercado !== '' ? true : false });
            })();
        };
    } else if (inputValue == "confirmar") {
        let novosDados = {
            cnpj: req.body.cnpjNovo,
            nome: req.body.nomeNovo,
            email: req.body.emailNovo,
            telefone: req.body.telefoneNovo,
            cep: req.body.cepNovo,
            logradouro: req.body.logradouroNovo,
            numero: req.body.numeroNovo,
            bairro: req.body.bairroNovo,
            cidade: req.body.cidadeNovo,
            uf: req.body.ufNovo,
            pais: req.body.paisNovo,
            complemento: req.body.complementoNovo,
            usuario: req.session.login,
        };
        
        let btnProdutos = global.mercado && global.mercado !== '' ? true : false;

        // Verifica os campos Obrigatórios
        if (novosDados.cnpj == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O CNPJ é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.nome == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O Nome é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.email == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O E-mail é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.telefone == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O Telefone é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.logradouro == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O Logradouro é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.bairro == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O Bairro é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.cidade == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "A Cidade é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.uf == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O UF é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else if (novosDados.pais == '') {
            res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "O País é obrigatório.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
        } else {
            // Verifica se CNPJ ou E-mail já existem no sistema
            (async () => {
                let cnpjExistente = await Mercado.verificaCNPJ(novosDados.cnpj);
                let emailExistente = await Mercado.verificaEmail(novosDados.email);
    
                if (cnpjExistente != false && novosDados.cnpj != global.mercado.cnpj) {
                    res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "CNPJ já cadastrado no sistema.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
                } else if (emailExistente != false && novosDados.email != global.mercado.email) {
                    res.render('mercado', { mercado: novosDados, mensagemDeErroAtualizar: "E-mail já cadastrado no sistema.", atualizarDados: true, mostrarBtnProdutos: btnProdutos });
                } else {
                    // Verifica se o Mercado está "vazio"
                    if (global.mercado && global.mercado !== '') {
                        // Atualiza o Mercado no Sistema
                        await Mercado.atualizarMercado(global.mercado.id, novosDados);
                    } else {
                        // Cria um Novo Mercado no sistema
                        await Mercado.novo(novosDados);
                    };

                    global.mercado = '';
                    res.redirect('mercado');
                };
            })();
        };
    } else if (inputValue == "deletar") {
        if (global.mercado && global.mercado !== '') {
            (async () => {
                await Mercado.deletarMercado(global.mercado.id);
                global.mercado = '';
                res.redirect('mercado');
            })();
        } else {
            res.redirect('mercado');
        };
    } else {
        res.redirect('mercado');
    };
});

app.post("/novo", function(req, res) {
    // Salva os Inputs
    global.novoUsuario = {
        segundoPasso: false,
        cpf: req.body.cpfCadastro,
        email: req.body.emailCadastro,
        senha: req.body.senhaCadastro,
        confirmaSenha: req.body.confirmaSenhaCadastro
    };

    // Verifica se os campos 'existem' e não estão vazios
    if (global.novoUsuario.cpf == '') {
        res.render('index', { mensagemDeErroCadastrar: "O CPF é obrigatório e precisa ser preenchido.", usuario: global.novoUsuario });
    } else if (global.novoUsuario.email == '') {
        res.render('index', { mensagemDeErroCadastrar: "O E-mail é obrigatório e precisa ser preenchido.", usuario: global.novoUsuario });
    } else if (global.novoUsuario.senha == '') {
        res.render('index', { mensagemDeErroCadastrar: "A Senha é obrigatória e precisa ser preenchida.", usuario: global.novoUsuario });
    } else if (global.novoUsuario.senha != global.novoUsuario.confirmaSenha) {
        res.render('index', { mensagemDeErroCadastrar: "O campo de Confirmação de Senha precisa ser Igual à Senha!", usuario: global.novoUsuario });
    } else {
        // Verifica se os campos já estão Cadastrados no Sistema
        (async () => {
            let cpfExistente = await Usuario.verificaCPF(global.novoUsuario.cpf);
            let emailExistente = await Usuario.verificaEmail(global.novoUsuario.email);

            if (cpfExistente != false) {
                res.render('index', { mensagemDeErroCadastrar: "CPF já cadastrado no Sistema!", usuario: global.novoUsuario });
            } else if (emailExistente != false) {
                res.render('index', { mensagemDeErroCadastrar: "E-mail já cadastrado no Sistema!", usuario: global.novoUsuario });
            } else {
                global.novoUsuario.segundoPasso = true;
                res.redirect('finalizar');
            };
        })();
    };
});

app.get("/finalizar", function(req, res) {
    // Verifica se a variável global "novoUsuário" existe
    if (global.novoUsuario != undefined && global.novoUsuario != '') {
        // Verifica se o "segundoPasso" está liberado
        if(global.novoUsuario.segundoPasso) {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso });
        } else {
            res.render('index', { usuario: global.novoUsuario });
        };
    } else {
        res.render('index');
    };
});

app.post("/finalizar", function(req, res) {
    // Verifica qual requisição foi feita
    let inputValue = req.body.novoUsuario;
    
    if (inputValue == "confirmar") {
        // Salva os Inputs
        global.novoUsuario = {
            segundoPasso: global.novoUsuario.segundoPasso,
            cpf: global.novoUsuario.cpf,
            email: global.novoUsuario.email,
            senha: global.novoUsuario.senha,
            foto: req.body.fotoCadastro,
            nome: req.body.nomeCadastro,
            cep: req.body.cepCadastro,
            logradouro: req.body.logradouroCadastro,
            numero: req.body.numeroCadastro,
            bairro: req.body.bairroCadastro,
            cidade: req.body.cidadeCadastro,
            pais: req.body.paisCadastro,
            uf: req.body.ufCadastro,
            complemento: req.body.complementoCadastro,
            telefone: req.body.telefoneCadastro,
        };

        // Verifica os campos Obrigatórios
        if (global.novoUsuario.cpf == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O CPF é obrigatório." });
        } else if (global.novoUsuario.email == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O E-mail é obrigatório." });
        } else if (global.novoUsuario.senha == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "A Senha é obrigatória." });
        } else if (global.novoUsuario.nome == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O Nome é obrigatório." });
        } else if (global.novoUsuario.logradouro == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O Logradouro é obrigatório." });
        } else if (global.novoUsuario.bairro == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O Bairro é obrigatório." });
        } else if (global.novoUsuario.cidade == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "A Cidade é obrigatório." });
        } else if (global.novoUsuario.uf == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O UF é obrigatório." });
        } else if (global.novoUsuario.pais == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O País é obrigatório." });
        } else if (global.novoUsuario.telefone == '') {
            res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "O Telefone é obrigatório." });
        } else {
            // Verifica se CPF ou E-mail já existem no sistema
            (async () => {
                let cpfExistente = await Usuario.verificaCPF(global.novoUsuario.cpf);
                let emailExistente = await Usuario.verificaEmail(global.novoUsuario.email);
            
                if (cpfExistente != false) {
                    res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "CPF já cadastrado no sistema!" });
                } else if (emailExistente != false) {
                    res.render('index', { usuario: global.novoUsuario, segundoPasso: global.novoUsuario.segundoPasso, mensagemDeErroCadastrar: "E-mail já cadastrado no sistema!" });
                } else {
                    // Cadastra o Usuário no Sistema
                    await Usuario.novo(global.novoUsuario);
                    req.session.login = global.novoUsuario.email;
                    global.novoUsuario = '';
                    res.redirect('usuario');
                };
            })();
        };
    } else {
        global.novoUsuario.segundoPasso = false;
        res.redirect('finalizar');
    };
});

app.get("/mercado", function(req, res) {
    if(!req.session.login) {
        // Se não tem usuário logado, volta pra página principal
        res.redirect('/');
    } else {
        // Se ele já carregou anteriormente o Mercado, então ele carrega a página com as informações guardadas, dessa forma evita pesquisar novamente no Banco de Dados.
        if (global.mercado && global.mercado !== '') {
            res.render('mercado', { mercado: global.mercado, mostrarBtnProdutos: true });
        } else {
            (async () => {
                let [mercado] = await Mercado.carregaDados(req.session.login);
                global.mercado = mercado;
                res.render('mercado', { mercado: global.mercado, mostrarBtnProdutos: global.mercado && global.mercado !== '' ? true : false });
            })();
        };
    };
});

app.get("/produtos", function(req, res) {
    if(!req.session.login) {
        // Se não tem usuário logado, volta pra página principal
        res.redirect('/');
    } else {
        // Pra entrar nessa página é OBRIGATÓRIO ter um mercado, logo verificasse exatamente isso:
        // Se ele já carregou anteriormente o Mercado, então ele carrega a página com as informações guardadas, dessa forma evita pesquisar novamente no Banco de Dados.
        if (global.mercado && global.mercado !== '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos });
            })();
        } else {
            (async () => {
                let [mercado] = await Mercado.carregaDados(req.session.login);
                global.mercado = mercado;

                // Verifica se tem algum mercado cadastrado no usuário atual (Provavlemente a Forma de chegar nesse ponto é somente com Link Direto)
                if (global.mercado && global.mercado !== '') {
                    (async () => {
                        let produtos = await Produto.carregaProdutos(global.mercado.id);
                        res.render('produtos', { produtos: produtos });
                    })();
                } else {
                    res.redirect('/mercado');
                };
            })();
        };
    };
});

app.post("/menu", function(req, res) {
    let inputValue = req.body.btnMenu;

    if (inputValue == "sair") {
        global.usuario = '';
        global.mercado = '';
        global.produtos = '';
        req.session.login = '';
        res.render('index');
    } else if (inputValue == "mercado") {
        res.redirect("mercado");
    } else if (inputValue == "usuario") {
        res.redirect("usuario");
    } else if (inputValue == "produtos") {
        res.redirect("produtos");
    };
});

app.post("/novoProduto", function(req, res) {
    let inputValue = req.body.btnNovo;

    if (inputValue == "confirmar") {
        let novosDados = {
            codIntMercado: global.mercado.id,
            nome: req.body.nomeNovo,
            descricao: req.body.descricaoNovo,
            marca: req.body.marcaNovo,
            unidadeMedida: req.body.unidadeMedidaNovo,
            medida: req.body.medidaNovo,
            lote: req.body.loteNovo,
            dataFabricacao: req.body.dataFabricacaoNovo,
            dataValidade: req.body.dataValidadeNovo,
            preco: req.body.precoNovo,
            foto: req.body.fotoNovo,
            categoria: req.body.categoriaNovo,
        };
        
        // Verifica os campos Obrigatórios
        if (novosDados.nome == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "O Nome é obrigatório." });
            })();
        } else if (novosDados.descricao == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Descrição é obrigatória." });
            })();
        } else if (novosDados.marca == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Marca é obrigatória." });
            })();
        } else if (novosDados.unidadeMedida == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Unidade de Medida é obrigatória." });
            })();
        } else if (novosDados.medida == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Medida é obrigatória." });
            })();
        } else if (novosDados.lote == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "O Lote é obrigatório." });
            })();
        } else if (novosDados.dataFabricacao == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Data de Fabricação é obrigatória." });
            })();
        } else if (novosDados.dataValidade == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Data de Validade é obrigatória." });
            })();
        } else if (novosDados.lote == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "O Preço é obrigatório." });
            })();
        } else if (novosDados.foto == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Foto é obrigatória." });
            })();
        } else if (novosDados.categoria == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Categoria é obrigatória." });
            })();
        } else {
            (async () => {
                // Insere o Produto no Sistema
                await Produto.cadastrarProduto(novosDados);
                res.redirect('produtos');
            })();
        };
    } else {
        res.redirect("produtos");
    };
});

app.post("/atualizarProduto", function(req, res) {
    let inputValue = req.body.btn;

    (async () => {
        let produtos = await Produto.carregaProdutos(global.mercado.id);
        let [dadosDoProduto] = await Produto.dadosDoProduto(inputValue);

        res.render('produtos', { produtos: produtos, dadosDoProduto: dadosDoProduto, atualizarProduto: true });
    })();
});

app.post("/confirmarAtualizacaoProduto", function(req, res) {
    let inputValue = req.body.btnAtualizar;
    
    if (inputValue == "confirmar") {
        let novosDados = {
            codIntProduto: req.body.idNovo,
            codIntMercado: req.body.mercadoIDNovo,
            nome: req.body.nomeNovo,
            descricao: req.body.descricaoNovo,
            marca: req.body.marcaNovo,
            unidadeMedida: req.body.unidadeMedidaNovo,
            medida: req.body.medidaNovo,
            lote: req.body.loteNovo,
            dataFabricacao: req.body.dataFabricacaoNovo,
            dataValidade: req.body.dataValidadeNovo,
            preco: req.body.precoNovo,
            foto: req.body.fotoNovo,
            categoria: req.body.categoriaNovo,
        };
        
        // Verifica os campos Obrigatórios
        if (novosDados.nome == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "O Nome é obrigatório.", atualizarProduto: true });
            })();
        } else if (novosDados.descricao == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Descrição é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.marca == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Marca é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.unidadeMedida == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Unidade de Medida é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.medida == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Medida é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.lote == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "O Lote é obrigatório.", atualizarProduto: true });
            })();
        } else if (novosDados.dataFabricacao == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Data de Fabricação é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.dataValidade == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Data de Validade é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.lote == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "O Preço é obrigatório.", atualizarProduto: true });
            })();
        } else if (novosDados.foto == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Foto é obrigatória.", atualizarProduto: true });
            })();
        } else if (novosDados.categoria == '') {
            (async () => {
                let produtos = await Produto.carregaProdutos(global.mercado.id);
                res.render('produtos', { produtos: produtos, dadosDoProduto: novosDados, mensagemDeErro: "A Categoria é obrigatória.", atualizarProduto: true });
            })();
        } else {
            (async () => {
                // Atualiza o Produto no Sistema
                await Produto.atualizarProduto(novosDados);

                res.redirect('produtos');
            })();
        };
    } else {
        res.redirect("produtos");
    };
});

app.post("/deletarProduto", function(req, res) {
    let inputValue = req.body.btn;

    (async () => {
        await Produto.deletarProduto(inputValue);
        res.redirect('produtos');
    })();
});

app.post("/pesquisaRapida", function(req, res) {
    let textoPesquisa = req.body.txtPesquisaSimples;

    // Verifica se os campos 'existem' e não estão vazios
    if (textoPesquisa) {
        (async () => {
            let produtos = await Pesquisa.pesquisaRapida(textoPesquisa);
            res.render('resultado', { produtos: produtos });
        })();
    } else {
        res.render('usuario', { usuario: global.usuario, mensagemDeErroPesquisa: "Preencha o campo de Pesquisa para procurar por um item." });
    };
});

app.post("/listaDeCompras", function(req, res) {
    let textoLista = req.body.txtListaDeCompras;
    let itens = textoLista.split(/\s*;\s*|\r?\n|\r|\n/g); // Separa os itens por quebra de linha e ponto e vírgula
    let itensFiltrados = itens.filter((item) => item.trim() !== ''); // Remove itens vazios ou em branco

    // Verifica se os campos 'existem' e não estão vazios
    if (textoLista) {
        let produtos = [];
        let itemsProcessed = 0;

        itensFiltrados.forEach((item, index, array) => {
            (async () => {
                produtos.push(await Pesquisa.pesquisaRapida(item));

                itemsProcessed++;

                if (itemsProcessed === array.length) {
                    res.render('resultadoLista', { produtos: produtos });
                };
            })();
        });
    } else {
        res.render('usuario', { usuario: global.usuario, mensagemDeErroPesquisa: "Preencha o campo da Lista de Compras com pelo menos 1 item para realizar a pesquisa." });
    };
});

app.listen(8081, function(){console.log("Servidor rodando na url http://localhost:8081");});
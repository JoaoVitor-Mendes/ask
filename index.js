const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require('./database/database');
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

connection
    .authenticate()
    .then(() => {
        console.log("Connection ok");
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    Pergunta.findAll({ raw: true, order:[
            ['id','DESC']
    ] }).then(perguntas => {
        res.render("index", {
            perguntas: perguntas
        });
    });
});

app.get("/perguntar", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta", (req, res) => {
    if ((!req.body.titulo) || (!req.body.descricao)){
        console.log("Vazio")
    } else {
        Pergunta.create({
            titulo: req.body.titulo,
            descricao: req.body.descricao
        }).then(() => {
            res.redirect("/");
        });
    }    
});

app.get("/pergunta/:id", (req, res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if (pergunta != undefined){        
            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order: [
                    ['id', 'DESC']
                ]
            }).then(respostas => {
                res.render("pergunta",{
                    pergunta: pergunta,
                    respostas: respostas
                });
            });           
        }else{
            res.render("/")
        }
    });
});

app.post("/responder", (req, res) => {
    var corpo = req.body.corpo
    var perguntaId = req.body.pergunta
    if (!corpo){
        console.log("Pergunta Vazia")
    }else{
        Resposta.create({
            corpo: corpo,
            perguntaId: perguntaId
        }).then(() =>{
            res.redirect("/pergunta/"+perguntaId);
        });
    }
});

app.listen(8081, () => {
    console.log("running");
});
const express = require('express')
const path = require('path')
const bodyParser= require('body-parser')
const mongoose = require('mongoose')
const app = express();

const Posts = require('./Posts.js')

mongoose.connect('mongodb+srv://clownser1994:nY5Y3aY4JBLnNoMO@cluster0.evzuits.mongodb.net/taiNew?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
    console.log('CONECTADO')
}).catch((err)=>{
    console.log(err.message)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use('/public', express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/pages'))

app.get('/', (req, res) => {
    if (req.query.busca == null) {
      Posts.find({}).sort({ _id: -1 })
        .then(posts => {
          posts = posts.map(val => {
            return {
              titulo: val.titulo,
              conteudo: val.conteudo,
              descricaoCurta: val.conteudo.substring(0, 100),
              imagem: val.imagem,
              slug: val.slug,
              categoria: val.categoria,
              autor: String,
              views: Number
            }
          });
  
          Posts.find({}).sort({ 'views': -1 }).limit(3)
            .then((postsTop) => {
              postsTop = postsTop.map((val) => {
                return {
                  titulo: val.titulo,
                  conteudo: val.conteudo,
                  descricaoCurta: val.conteudo.substr(0, 100),
                  imagem: val.imagem,
                  slug: val.slug,
                  categoria: val.categoria,
                  views: val.views
                }
              });
  
              res.render('home', { posts: posts, postsTop: postsTop });
            })
            .catch(error => {
              console.error(error);
            });
        })
        .catch(error => {
          console.error(error);
        });
    } else {
        Posts.find({ titulo: { $regex: req.query.busca, $options: "i" } })
        .then(posts => {
          res.render('busca', { posts: posts, contagem:posts.length });
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Erro interno do servidor');
        });
      
    }
  });
  

  app.get('/:slug', (req, res) => {
    const slug = req.params.slug;
  
    Posts.find({}).sort({ 'views': -1 }).limit(3)
      .then((postsTop) => {
        postsTop = postsTop.map((val) => {
          return {
            titulo: val.titulo,
            conteudo: val.conteudo,
            descricaoCurta: val.conteudo.substr(0, 100),
            imagem: val.imagem,
            slug: val.slug,
            categoria: val.categoria,
            views: val.views
          }
        });
  
        Posts.findOne({ slug: slug })
          .then(noticia => {
            if (noticia) {
              res.render('single', { noticia: noticia, postsTop: postsTop });
            } else {
              res.status(404).send('Notícia não encontrada');
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).send('Erro interno do servidor');
          });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
      });
  });
  
  

app.listen(5050, ()=>{
    console.log('server Rodando')
})

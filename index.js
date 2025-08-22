const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',          
  password: 'root',          
  database: 'sew' 
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL!');
  }
});

app.post('/lotes', (req, res) => {
  const lote = req.body;
  const sqlInsert = `
    INSERT INTO controle_lotes 
    (ordem_montagem, ordem_venda, cliente, item_venda, equipamento, quantidade_total, reprovado, local, defeito, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;


  connection.query(
    'SELECT * FROM controle_lotes WHERE ordem_montagem = ?',
    [lote.om],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar duplicidade' });
      }

      if (rows.length > 0) {
        return res.status(400).json({ error: 'Já existe lote com essa OM!!' });
      }

      connection.query(
        sqlInsert,
        [
          lote.om,
          lote.ov,
          lote.cliente,
          lote.item,
          lote.equipamento,
          lote.quantiTotal,
          lote.reprovado,
          lote.local,
          lote.defeito,
          lote.status
        ],
        (err, result) => {
          if (err) {
            console.error('Erro ao inserir lote:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar lote' });
          }
          res.status(201).json({ message: 'Lote cadastrado com sucesso!' });
        }
      );
    }
  );
});

app.listen(3000, '0.0.0.0', () => {
  console.log('API rodando em http://0.0.0.0:3000');
});


app.get('/lotes', (req, res) => {
  const sql = 'SELECT * FROM controle_lotes ORDER BY data DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar lotes:', err);
      res.status(500).json({ error: 'Erro ao buscar lotes' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/lotes/om/:om', (req, res) => {
  const ordemMontagem = req.params.om;

  const sql = 'SELECT * FROM controle_lotes WHERE ordem_montagem = ? ORDER BY data DESC';
  connection.query(sql, [ordemMontagem], (err, results) => {
    if (err) {
      console.error('Erro ao buscar lote pela OM:', err);
      return res.status(500).json({ error: 'Erro ao buscar lote' });
    }
    res.status(200).json(results);
  });
});

app.patch('/lotes/finalizar/:om', (req, res) => {
  const ordemMontagem = req.params.om;
  const dataFinalizacao = new Date();
  const status = 'Pronto';

  const sql = 'UPDATE controle_lotes SET status = ?, data_finalizacao = ? WHERE ordem_montagem = ?';
  connection.query(sql, [status, dataFinalizacao, ordemMontagem], (err, result) => {
    if (err) {
      console.error('Erro ao finalizar lote:', err);
      return res.status(500).json({ error: 'Erro ao finalizar lote' });
    }
    res.status(200).json({ message: 'Ordem finalizada com sucesso!' });
  });
});



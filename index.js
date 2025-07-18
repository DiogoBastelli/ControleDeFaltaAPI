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
  const sql = `
    INSERT INTO controle_lotes 
    (ordem_montagem, ordem_venda, cliente, item_venda, equipamento, quantidade_total, quantidade_recebida) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(
    sql,
    [lote.om, lote.ov, lote.cliente, lote.item, lote.equipamento, lote.quantiTotal, lote.quantiDesc],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir lote:', err);
        res.status(500).send('Erro ao cadastrar lote');
      } else {
        res.status(200).json({ message: 'Lote cadastrado com sucesso!' });

      }
    }
  );
});

app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});

app.get('/lotes', (req, res) => {
  const sql = 'SELECT * FROM controle_lotes ORDER BY data_recebimento DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar lotes:', err);
      res.status(500).json({ error: 'Erro ao buscar lotes' });
    } else {
      res.status(200).json(results);
    }
  });
});

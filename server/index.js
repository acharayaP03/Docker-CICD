const keys = require('./keys');

//Express app setup..

const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//use middleware

app.use(cors());
app.use(express.json());

//Postgres setup.
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
  });

//Redis Client Setup

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

//Express routes

app.get('/', (req, res) =>{
    res.send('<h1> Hi there... </h1>')
});

app.get('/values/all', async (req, res) =>{
    try {        
        const values = await pgClient.query('SELECT * FROM values');
    
        res.send(values.rows);
    } catch (error) {
        console.log(error)
    }
});

app.get('/values/current', async (req, res) =>{
    try {        
        redisClient.hgetall('values', (err, values) =>{
            res.send(values);
        });
    } catch (error) {
        console.log(error)
    }
});

app.post('/values', async (req, res) =>{
    try {        
        const index = req.body.index;
        if(parseInt(index) > 40){
            return res.status(422).send("Index Too High");
        };
        redisClient.hset('values', index, 'Nothing yet!');
        redisPublisher.publish('insert', index);
        pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    
        res.send({ working: true});
    } catch (error) {
        console.log(error)
    }
})

//Listening to the port 
app.listen(5000, () =>{
    console.log('...... Serving is running ......')
})
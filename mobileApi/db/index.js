const { Client } = require("pg");
const client = new Client({
  connectionString: "postgresql://postgres:postgresql@alaam.net:5432/allam_cms"
  //postgres://postgres:postgres@localhost:5432/allam_cms
});

client.connect();

module.exports = client;
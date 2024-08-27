const { Client } = require("pg");
const client = new Client({
  connectionString: "postgresql://postgres:postgresql@localhost:5432/allam_cms"
  //rds
  //connectionString: "postgresql://eduadminalaam:3dut3ch2o2!N3wl!v3@alaamlive.crs6xfbo7sst.me-south-1.rds.amazonaws.com:5432/alaamlive"
  //postgres://postgres:postgres@localhost:5432/allam_cms
});

client.connect();

module.exports = client;
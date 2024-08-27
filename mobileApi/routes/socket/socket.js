const express = require("express");
const router = express.Router();
const db = require("../../db");
const transport = require("../../config/smtp.js");
const common = require("../../config/common.js");


module.exports = function(io) {

    //we define the variables
    var sendResponse = function () {};

    io.sockets.on("connection",function(socket){
        // Everytime a client logs in, display a connected message
        console.log("Server-Client Connected!");

        socket.on('addPlayer', function(data) {
            //listen to event at anytime (not only when endpoint is called)
            //execute some code here
             socket.emit('taskResponse', data);
        });


        socket.on('taskResponse', data => {
            //calling a function which is inside the router so we can send a res back
            sendResponse(data);
        })     
    });

    router.post('/', async (req, res) => {

        //pickedUser is one of the connected client
        var pickedUser = "JZLpeA4pBECwbc5IAAAA";
        io.to(pickedUser).emit('taskRequest', req.body);

        sendResponse = function (data) {
            return res.status(200).json({"text": "Success", "response": data.data});
        }

    });

    return router;
    

  };
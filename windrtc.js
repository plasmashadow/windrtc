/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



function WebRTCServer(port)
{
    /*
     * injecting dependencies
     * Express.js is only for testing.
     */
var self=this;
var express = require('express');
self.app = express();
self.server=require('http').Server(self.app);
self.io=require('socket.io')(self.server);

self.app.get("/",function(req,res){
   res.sendfile(__dirname+"/index.html"); 
});
self.app.get("/peerconnection.js",function(req,res){
    res.sendfile(__dirname+"/PeerConnection.js");
});
self.server.listen(port);
self.io.sockets.on('connection',function(socket){
     socket.on('emitice',function(data){
    	console.log('got ice candidate');
        self.io.sockets.emit('sendice',data);
    });
    socket.on('emitoffer',function(data){
    	console.log("got offer");
        if(data.to===undefined)
        {
        self.io.sockets.emit('reciveoffer',data);
        }
        else
        {
           self.io.sockets.to(data.to).emit('reciveoffer',data);
        }
    });
    socket.on('emitanswer',function(data){
    	console.log("emit answer");
    	self.io.sockets.emit('reciveanswer',data);
    });
});

}

var rtcserver=new WebRTCServer(8080);
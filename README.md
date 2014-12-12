<h1> WindRTC PeerConnection Library </h1>

```javascript
     //client side
    var connection=new PeerCallConnection({host:hostname,port:portnumber});
    connection.startVideoCall();
    connection.call();
```
Server Side Abstaraction

```javascript
    var server =new WebRTCServer(portnumber);
```

<h4>For Text Chat </h4>

```javascript
   var connection=new TextSharing({host:hostname,port:portnumber});
   connection.openChannel();
```

<h4>For File Sharing </h4>

```javascript
   var connection=new FileShare({host:hostname,port:portnumber});
   connection.Send();
```
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

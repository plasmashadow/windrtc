/* 
 @author Plasmashadow
Copyright (c) 2014, Rwind Technology Co-operation Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
 */
/* Adding Configuration Part*/
 var mediaConstraints = {
					optional: [],
					mandatory: {
						OfferToReceiveAudio: true,
						OfferToReceiveVideo: true
					}
				};
var optionalRtpDataChannels = {
    optional: [{
        RtpDataChannels: true
    }]
};
                
                window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
                window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

                navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                window.URL = window.webkitURL || window.URL;

                window.iceServers = {
                    iceServers: [
                        {url: 'stun:23.21.150.121'},
                        {url: "stun:stun.l.google.com:19302"},
                        {url: "stun:stun.sipgate.net"},
                        {url: "stun:217.10.68.152"},
                        {url: "stun:stun.sipgate.net:10000"},
                        {url: "stun:217.10.68.152:10000"}
                    ]
                };
                 var video_constraints = {
                    mandatory: {},
                    optional: []
                };

                function getUserMedia(callback) {
                    var n = navigator;
                    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
                    n.getMedia({
                        audio: true,
                        video: video_constraints
                    }, callback, onerror);

                    function onerror(e) {
						alert(JSON.stringify(e, null, '\t'));
                    }
                }
function PeerCallConnection(data)
{
    var self=this;
    self.host=data.host;
    self.port=data.port;
     self.socket=io.connect("http://"+self.host+":"+self.port);
    self.Driver=getUserMedia;
    function ErrorHandler(error)
    {
        console.log(error);
    }
    self.connection=new RTCPeerConnection(window.iceServers);
    /*
     * 
     * Adding Listeners to the peer connection.
     *
     */
    
    self.socket.on("sendice",function(data){
       self.connection.addIceCandidate(new RTCIceCandidate(data)); 
    });
    
    self.connection.onicecandidate=function(event){
        if(!event || !event.candidate)return;
        self.socket.emit("emitice",event.candidate);
    }
    
    /*
     *
     *Create An Offer for the peer to give it to answerer
     *  
     */
    
    self.call=function(){
        self.connection.createOffer(function(offer){
            self.connection.setLocalDescription(offer);
            self.socket.emit("emitoffer",offer);
        },ErrorHandler,mediaConstraints);
    }
    
    self.callto=function(to){
        self.connection.createOffer(function(offer){
            self.connection.setLocalDescription(offer);
            self.socket.emit("emitoffer",{to:to,offer:offer});
        },ErrorHandler,mediaConstraints);
    }
    /*
     * Handler to reciver answer from the peer while calling.
     */
    self.socket.on("reciveanswer",function(data){
        self.connection.setRemoteDescription(new RTCSessionDescription(data)); 
    });
    
    self.socket.on("reciveoffer",function(data){
       self.connection.setRemoteDescription(new RTCSessionDescription(data));
       self.connection.createAnswer(function(answer){
           self.connection.setLocalDescription(answer);
           self.socket.emit("emitanswer",answer);
       },ErrorHandler,mediaConstraints);
    });
    /*
     * Start Method is used to create a server
     * @param {string} parent window id
     * @returns {undefined}
     */
    self.startVideoCall=function(parentwindowid)
    {
        self.parentwindowname=parentwindowid;
        self.Driver(function(stream){
            var video=document.createElement("video");
            video.src=URL.createObjectURL(stream);
            video.play();
            self.connection.addStream(stream);
            document.getElementById(parentwindowid).appendChild(video);
        });
    }
    /*
     * This function will be triggered we our socket get connection from some 
     * peer.
     * @param {type} event
     * @returns {undefined}
     */
    self.connection.onaddstream=function(event){
            var video=document.createElement("video");
            video.src=URL.createObjectURL(event.stream);
            video.play();
            document.getElementById(self.parentwindowname).appendChild(video);
    }
    
    
}


function TextSharing(data)
{
   var self=this;
   self.host=data.host;
   self.port=data.port;
   self.socket=io.connect("http://"+self.host+":"+self.port);    
   
   self.connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
   
    function ErrorHandler(error)
    {
        console.log(error);
    }
   
    self.socket.on("sendice",function(data){
        console.log("recived ice");
       self.connection.addIceCandidate(new RTCIceCandidate(data)); 
    });
    
    self.connection.onicecandidate=function(event){
        if(!event || !event.candidate)return;
        console.log("emitted ice");
        self.socket.emit("emitice",event.candidate);
    }
    
      self.socket.on("reciveanswer",function(data){
          console.log("recived answer");
        self.connection.setRemoteDescription(new RTCSessionDescription(data)); 
    });
    
    self.socket.on("reciveoffer",function(data){
       self.connection.setRemoteDescription(new RTCSessionDescription(data),function(){
           self.connection.createAnswer(function(answer){
           self.connection.setLocalDescription(answer);
           console.log("emitting answer");
           self.socket.emit("emitanswer",answer);
       },ErrorHandler,mediaConstraints);
       });
       
    });
    
    self.channel=self.connection.createDataChannel('webchannel');
        self.channel.onmessage = function (event) {
            console.log("on message event no-triggring");
            console.log( 'received a message:', event.data);
        };

        self.channel.onopen = function () {
            console.log("emit RTP data");
            self.channel.send('first text message over RTP data ports');
            self.channel.send("hey i got the message");
        };
        self.channel.onclose = function (e) {
            console.error(e);
        };
        self.channel.onerror = function (e) {
            console.error(e);
        };
    self.openChannel=function(){

        self.CreateOffer();
    }
    self.sendMessage=function(data){
        self.channel.send(data);
    }
    // self.connection.ondatachannel=function(event){
    //     // var recivechannel=event.channel;
    //     // recivechannel.onmessage=function(event){
    //     //     console.log(event.data);
    //     // }
    //     // recivechannel.onopen=function(){
    //     //     console.log("channel has been opened");
    //     //     recivechannel.send("hey i got the message");
    //     // }
    //     // recivechannel.onclose=function(err){
    //     //     console.log("channel closed");
    //     // }
    // }
    
    self.CreateOffer=function(){
        self.connection.createOffer(function(offer){
            self.connection.setLocalDescription(offer);
            console.log("emitting offer");
            self.socket.emit("emitoffer",offer);
        },ErrorHandler,mediaConstraints);
    };
}


function FileShare(data)
{
  var self=this;
  var arrayToStoreChunks=[];
  self.host=data.host;
  self.port=data.port;
  self.socket=io.connect("http://"+self.host+":"+self.port);    
  var chunkLength = 1000;
   /*
    *  Finding 
    */
  (function(){
      var input =document.createElement("input");
      input.setAttribute("type","file");
      document.body.appendChild(input);
  })();
  /*
  creating a file sharing.
  */
  self.connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
   
    function ErrorHandler(error)
    {
        console.log(error);
    }

      self.socket.on("sendice",function(data){
        console.log("recived ice");
       self.connection.addIceCandidate(new RTCIceCandidate(data)); 
    });
    
    self.connection.onicecandidate=function(event){
        if(!event || !event.candidate)return;
        console.log("emitted ice");
        self.socket.emit("emitice",event.candidate);
    }
    
      self.socket.on("reciveanswer",function(data){
          console.log("recived answer");
        self.connection.setRemoteDescription(new RTCSessionDescription(data)); 
    });
    
    self.socket.on("reciveoffer",function(data){
       self.connection.setRemoteDescription(new RTCSessionDescription(data),function(){
           self.connection.createAnswer(function(answer){
           self.connection.setLocalDescription(answer);
           console.log("emitting answer");
           self.socket.emit("emitanswer",answer);
       },ErrorHandler,mediaConstraints);
    });
    });

    self.channel=self.connection.createDataChannel('webchannel');
        self.channel.onmessage = function (event) {
           var data = JSON.parse(event.data);
           console.log(data.file_name);
           arrayToStoreChunks.push(data.message); 
           console.log(JSON.stringify(data));
           console.log(data.message);// pushing chunks in array
           if (data.last) 
            {
          saveToDisk(arrayToStoreChunks.join(''), data.name);
          arrayToStoreChunks = []; // resetting array
            }
        };

        self.channel.onopen = function () {
            console.log("emit RTP data");
            //self.channel.send('first text message over RTP data ports');
          //  self.channel.send("hey i got the message");
        };
        
        self.channel.onclose = function (e) {
            console.error(e);
        };
        
        self.channel.onerror = function (e) {
            console.error(e);
        };
        function saveToDisk(fileUrl, fileName) {
            console.log("saving to the disk");
              var save = document.createElement('a');
              save.href = fileUrl;
              save.target = '_blank';
              save.setAttribute('download', fileName);
              document.body.appendChild(save);
              var event = document.createEvent('Event');
              save.click();
              // event.initEvent('click', true, true);

              // save.dispatchEvent(event);
              console.log(save.href);
              URL.revokeObjectURL(save.href);
          }
        document.querySelector('input[type=file]').onchange=function(){

            self.file=this.files[0];
            console.log(self.file.name);
            console.log(self.file)
            self.CreateOffer();
        }
        var name;
        self.Send=function()
        {
            var reader = new FileReader();
            reader.readAsDataURL(self.file);
            name=self.file.name;
            reader.onload=onReadAsDataURL;
        }
     function onReadAsDataURL(event, text) {
            var data = {}; // data object to transmit over data channel

            if (event) text = event.target.result; // on first invocation

            if (text.length > chunkLength) {
                data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
            } else {
                data.message = text;
                data.last = true;
            }
            data.name=name;
             console.log(data);
             self.channel.send(JSON.stringify(data)); // use JSON.stringify for chrome!

            var remainingDataURL = text.slice(data.message.length);
            if (remainingDataURL.length) setTimeout(function () {
                onReadAsDataURL(null, remainingDataURL); // continue transmitting
            }, 500)
          }



     self.openChannel=function(){
        self.CreateOffer();
    }
     self.CreateOffer=function(){
        self.connection.createOffer(function(offer){
            self.connection.setLocalDescription(offer);
            console.log("emitting offer");
            self.socket.emit("emitoffer",offer);
        },ErrorHandler,mediaConstraints);
    };

}

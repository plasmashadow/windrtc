
/*
     INITIALIZING STATIC PARAMETERS
*/
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


function PeerConnection(data)
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
    self.connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
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
    
    self.Connect=function(){
        self.connection.createOffer(function(offer){
            self.connection.setLocalDescription(offer);
            self.socket.emit("emitoffer",offer);
        },ErrorHandler,mediaConstraints);
    }

    /*
     * Handler to reciver answer from the peer while calling.
     */
    self.socket.on("reciveanswer",function(data){
        self.connection.setRemoteDescription(new RTCSessionDescription(data)); 
    });
    
    self.socket.on("reciveoffer",function(data){
        console.log("recived a offer");
       self.connection.setRemoteDescription(new RTCSessionDescription(data),function(){
        self.connection.createAnswer(function(answer){
           self.connection.setLocalDescription(answer);
           console.log("Emiting an answer");
           self.socket.emit("emitanswer",answer);
       },ErrorHandler,mediaConstraints);
       });
       
    });
    /*
     * Start Method is used to create a server
     * @param {string} parent window id
     * @returns {undefined}
     */
    self.startVideo=function(parentwindowid)
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

    function setChannelEvent(channel)
    {
         channel.onmessage=function(event)
         {
            console.log(event.data)
         };
         channel.onopen = function () {
             channel.send('first text message over RTP data ports');
         };
         channel.onclose = function (e) {
            console.error(e);
         };
         channel.onerror = function (e) {
            console.error(e);
         };
    }

    self.startChannel=function()
    {

        var channelobj=self.connection.createDataChannel('RTCDataChannel', {
          reliable: false
        }
        channel.onmessage=function(event)
         {
            console.log(event.data)
         };
         channel.onopen = function () {
             channel.send('first text message over RTP data ports');
         };
         channel.onclose = function (e) {
            console.error(e);
         };
         channel.onerror = function (e) {
            console.error(e);
         };
        self.Connect();
        
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
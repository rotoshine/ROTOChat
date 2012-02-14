//require.paths.unshift('./node_modules');

var port = Number(process.env.VCAP_APP_PORT || 3000);
var host = process.env.VCAP_APP_HOST || "localhost";
var io = require("socket.io").listen(port, host); 

// 사용자 목록을 담고 있는 오브젝트
var userList = new Object();
Array.prototype.removeItem = function(removeItem) {		
	var idx = this.indexOf(removeItem);
	return (idx<0 || idx>this.length) ? this : this.slice(0, idx).concat(this.slice(idx+1, this.length));
};
// 웹소켓 연결 시의 처리
io.sockets.on("connection", function(socket) { 
	
	socket.on("joinChannel", function(msg){
		var channel = msg.channel;
		socket.join(channel);
		
		socket.userName = validText( msg.user.userName );
		console.log( "<"  + socket.handshake.address.address + "> " + socket.userName + " connect.");
		if( !userList.hasOwnProperty(channel) ){
			userList[channel] = new Array();
		}
		userList[channel].push( socket.userName );
		var msgObject = {			
			joinUserName : socket.userName,
			userList : userList[channel],
			channel : channel
		};
		sendMessageToChannel("join", channel, msgObject);		
	});
	
	
	// 메시지 수신 시 다른 클라이언트들에게 메시지를 송신
	socket.on("chat", function(msg) { 
		
		var message = validText( msg.value );
		var msgObject = {
			userName : socket.userName,
			msg : message,
			channel : msg.channel,
			receiveDate : new Date()
		};
		sendMessageToChannel("chat", msg.channel, msgObject);
		
	}); 

	// 채널에서 나갈 떄의 처리
	socket.on("leave", function(msg) { 
		leaveChannel(msg.channel);
	}); 
	
	// 소켓 연결 해제시 다른 사용자들에게 누가 접속을 종료했는지 통보한다.
	socket.on("disconnect", function(){
		// 채널 전부에 leave emit을 날려야 한다.
		// TODO 현재 나가는 사용자가 join해있는 채널에만 emit을 날리는 방법을 생각해보자.
		for( var channel in userList ) {
			console.log( channel );
			leaveChannel(channel);
		}
		
	});
	function validText( msg ){
		var validTargetMsg = msg.toLowerCase();
		if( validTargetMsg.indexOf("<script>") >= 0){
			msg = "script nono  -_-";
		}
		if( msg != null ){
			msg = msg.split("<").join("").split(">").join("");
		}
		return msg;
	}

	function sendMessageToChannel(msgType, channel, msgObject){
		io.sockets.in(channel).emit(msgType, msgObject );
		console.log("메시지 보내는 사람 :" + socket.userName);
		console.log("메시지 타입 :" + msgType);
		if( msgObject.hasOwnProperty("msg") ){
			console.log("(" + channel + ")" + msgObject.msg);
		}		
	}

	/**
	 * 채널에서 나간다.
	 */
	function leaveChannel(channel){
		// channel 사용자 목록에서 현재 사용자를 제외하기 위한 처리.
		userList[channel] = userList[channel].removeItem(socket.userName);		
		io.sockets.in(channel).emit("leave", {
			channel : channel,
			leaveUserName : socket.userName 
		});	
	}
});


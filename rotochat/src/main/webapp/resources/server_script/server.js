//require.paths.unshift('./node_modules');

var port = Number(process.env.VCAP_APP_PORT || 3000);
var host = process.env.VCAP_APP_HOST || "localhost";
var io = require("socket.io").listen(port, host); 

// 사용자 목록을 담고 있는 오브젝트
var userList = new Object();

// 웹소켓 연결 시의 처리
io.sockets.on("connection", function(socket) { 
	
	socket.on("setUserInfo", function(msg){
		var chatRoomName = msg.chatRoomName;
		socket.chatRoomName = chatRoomName;
		socket.join(chatRoomName);
		
		socket.userName = validText( msg.user.userName );
		console.log( "<"  + socket.handshake.address.address + "> " + socket.userName + " connect.");
		if( !userList.hasOwnProperty(chatRoomName) ){
			userList[ chatRoomName ] = [];
		}
		userList[ chatRoomName ].push( socket.userName );
		var msgObject = {			
			joinUserName : socket.userName,
			userList : userList[ chatRoomName ]
		};
		sendMessageToChatRoom("join", msgObject);		
	});
	
	
	// 메시지 수신 시 다른 클라이언트들에게도 메시지를 보냄
	socket.on("chat", function(msg) { 
		
		var message = validText( msg.value );
		console.log( socket.userName + " : " + message );
		var msgObject = {
			userName : socket.userName,
			msg : message,
			receiveDate : new Date()
		};
		sendMessageToChatRoom("chat", msgObject);
		
	}); 

	// 소켓 연결 해제시 다른 사용자들에게 누가 접속을 종료했는지 통보한다.
	socket.on("disconnect", function() { 
		// 접속자를 제외한 새로운 사용자 목록 배열을 생성
		var newUserList = [];
		var nowRoomUserList = userList[socket.chatRoomName];
		
		if( nowRoomUserList != null ){		
			for( var i = 0; i < nowRoomUserList.length; i++){			
				if( nowRoomUserList[i] != socket.userName ){				
					newUserList.push(nowRoomUserList[i]);
				}
			}
			userList[socket.chatRoomName] = newUserList;
		}
		var msgObject = {
			outUserName : socket.userName,
			userList : newUserList
		};
		console.log(socket.userName + " disconnect.");
		io.sockets.in(socket.chatRoomName).emit("out", msgObject );	
		console.log("roomName:" + socket.chatRoomName);
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

	function sendMessageToChatRoom(msgType, msgObject){
		io.sockets.in(socket.chatRoomName).emit(msgType, msgObject );
		console.log("roomName:" + socket.chatRoomName);
	}
});


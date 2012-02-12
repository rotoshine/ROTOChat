//require.paths.unshift('./node_modules');

var port = Number(process.env.VCAP_APP_PORT || 3000);
var host = process.env.VCAP_APP_HOST || "localhost";
var io = require("socket.io").listen(port, host); 

// ����� ����� ��� �ִ� ������Ʈ
var userList = new Object();

// ������ ���� ���� ó��
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
	
	
	// �޽��� ���� �� �ٸ� Ŭ���̾�Ʈ�鿡�Ե� �޽����� ����
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

	// ���� ���� ������ �ٸ� ����ڵ鿡�� ���� ������ �����ߴ��� �뺸�Ѵ�.
	socket.on("disconnect", function() { 
		// �����ڸ� ������ ���ο� ����� ��� �迭�� ����
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


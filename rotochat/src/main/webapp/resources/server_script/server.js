//require.paths.unshift('./node_modules');

var port = Number(process.env.VCAP_APP_PORT || 3000);
var host = process.env.VCAP_APP_HOST || "localhost";
var io = require("socket.io").listen(port, host); 

var channelList = new Object();
var userList = new Object();

// Array 객체에 특정 아이템을 삭제하는 함수 추가 
Array.prototype.removeItem = function(item){
	var idx = this.indexOf(channelName);
	return (idx < 0 || idx > this.length) ? this : this.slice(0, idx).concat(this.slice(idx + 1, this.length));
};

// 주기적으로 생성된 채널 목록을 로깅하기 위한 부분
function loggingStart(){
	setInterval(function(){
		console.log("----------------------접속자 정보-------------------------");
		for( var userName in userList ){
			console.log("대화명 : " + userList[userName].getName() + " , 접속 중인 채널 수 : " + userList[userName].getJoinChannelList().length );
		}
		console.log("------------------------------------------------------------");
		
		console.log("-----------------------채널 정보----------------------------");
		for( var channelName in channelList ){
			console.log("채널명 : " + channelName + ", 접속자 수 : " + channelList[channelName].getJoinUserList().length );
		}
		console.log("------------------------------------------------------------");
	}, 10000);
}

loggingStart();

// 웹소켓 연결 시의 처리
io.sockets.on("connection", function(socket) {
	
	// 사용자 생성 요청이 들어왔을 때의 처리
	socket.on("createUser", function(message){
		// 이미 사용 중인 사용자 이름인 경우, 사용자명을 다시 설정하도록 함.
		if(userList.hasOwnProperty(message.user.userName)){
			socket.emit("alreadyUseUserName");
		}else{
			var userName = message.user.userName;
			
			// 사용자 객체 생성
			var user = {
				name : userName,
				joinChannelList : new Array(),				
				getName : function(){
					return this.name;
				},		
				join : function(channel){
					if(!this.joinChannelList.indexOf(channel) > -1){
						this.joinChannelList.push(channel);
					}
				},
				leave : function(channelName){
					this.joinChannelList = this.joinChannelList.removeItem(channelName);
				},
				getJoinChannelList : function(){
					return this.joinChannelList;
				}
			};
			socket.userName = userName;
			userList[userName] = user;
			socket.emit("createUserComplete");
		}		
	});
	
	socket.on("join", function(msg){
		var channelName = msg.channel;
		
		socket.join( channelName );
		userList[socket.userName].join(channelName);
		
		// 생성되지 않은 채널이면 채널을 생성하고 채널 목록에 추가한다.		
		if( !channelList.hasOwnProperty( channelName ) ){
			var channel = {
				name : channelName,
				joinUserList : new Array(),				
				getName : function(){
					return this.name;
				},
				getJoinUserList : function(){
					return this.joinUserList;
				},
				joinUser : function(userName){
					if(!this.joinUserList.indexOf(userName) > -1){
						this.joinUserList.push(userName);
					}
				},
				leaveUser : function(userName){
					this.joinUserList = this.joinUserList.removeItem(userName);
				},
				isEmpty : function(){
					return (this.joinUserList.length == 0);
				}
			};
			channelList[channelName] = channel;
			console.log("채널이 생성되었습니다. 채널명 : " + channelName);
		}
		
		channelList[channelName].joinUser( socket.userName );
		console.log( "<"  + socket.handshake.address.address + "> " + socket.userName + " connect.");
		
		var msgObject = {			
			joinUserName : socket.userName,
			userList : channelList[channelName].getJoinUserList(),
			channel : channelName
		};
		sendMessageToChannel("join", channelName, msgObject);		
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
		// 사용자 목록에 유효한 사용자인 경우에만 disconnect 처리
		if( userList.hasOwnProperty(socket.userName) ){			
			// 사용자가 접속해있는 채널 전부에 leave emit을 날린다.
			var userName = socket.userName;
			var joinChannelList = userList[userName].getJoinChannelList();
			for( var i = 0; i < joinChannelList.length; i++ ) {
				leaveChannel(joinChannelList[i]);
			}
			delete userList[userName];
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
		if(msgObject.hasOwnProperty("msg")){
			console.log("(" + channel + ")" + msgObject.msg);
		}		
	}

	/**
	 * 채널에서 나간다.
	 */
	function leaveChannel(channelName){
		channelList[channelName].leaveUser(socket.userName);
		userList[socket.userName].leave(channelName);
		io.sockets.in(channelName).emit("leave", {
			channel : channelName,
			leaveUserName : socket.userName 
		});
		
		// 채널에 접속자가 없는 경우 채널 목록에서 채널을 제거한다.
		if(channelList[channelName].isEmpty()){
			delete channelList[channelName];
			console.log("접속자가 없어 다음 채널은 제거됩니다. 채널명 : " + channelName);
		}
	}
});


var user = new Object();
var messageCount = 0;
var socket = io.connect("http://localhost:3000");

$(function(){		
	$("#channelTab").tabs();
	
	log("<b>서버에 접속 중입니다....잠시만 기다려주십시오....</b>");
	
	socket.on("connect", function(){
		log("<b>서버 접속에 성공하였습니다.</b>");
		if( !user.hasOwnProperty("userName") ){
			user.userName = setUserName();	
			socket.emit("createUser", {
				user : user
			});				
		}
	});
	
	socket.on("alreadyUseUserName", function(){
		alert("이미 사용 중인 대화명입니다.");
		user.userName = setUserName();	
		socket.emit("createUser", {
			user : user				
		});
	});
	
	socket.on("createUserComplete", function(msgObject){
		var channelName = getJoinChannelName();	
		joinChannel(channelName);
	});
	
	
	socket.on("join", function(msgObject){
		log("<b>" + msgObject.joinUserName + "님이 접속하셨습니다.", msgObject.channel);
		setUserList( msgObject.channel, msgObject.userList );	
	});
	
	socket.on("leave", function(msgObject){
		log("<b>" + msgObject.leaveUserName + "님이 나가셨습니다.", msgObject.channel);
		
		// 접속자 목록에서 나간 사람을 제거
		userListRemove( msgObject.channel , msgObject.leaveUserName);			
	});
	
	socket.on("chat", function(msgObject){		
		var chatMessage = "<span>" + msgObject.userName + " : "  + msgObject.msg + "</span>";
		log(chatMessage, msgObject.channel);		
	});
	
	socket.on("disconnect", function(){
		log("<b>서버와의 접속이 종료되었습니다.</b>");
	});
	
	resizeWindow();
	
	$(window).resize(function(){
		resizeWindow();	
	});
	
	// 엔터키 누르면 메시지 보내기
	$("#inputMessage").keydown(function(e){
		ifKeycodeIsEnterkeyThenSendMessage(e.keyCode);
	});
});

function resizeWindow(){
	var windowHeight =  $(window).height() - 120;
	var windowWidth = $(window).width() - 50;
	$(".channelLog").css("height", windowHeight + "px");
	$(".log").css("height", (windowHeight - 20 )+ "px");	
	$(".channelLog").css("width", windowWidth - 50 + "px");
	
}
function log(message, channel){
	if( channel == undefined ){
		channel = getSelectedChannelName();
	}
	$("#" + channel + " > .log").append(message + "<br>" );
	console.log("#" + channel + " : " + message );
	messageCount++;
	
	// 스크롤 맨 아래로 내리기
	$("#" + channel + " > .log").scrollTop( messageCount * 20 );
			
}; 

function ifKeycodeIsEnterkeyThenSendMessage(keyCode){
	if( keyCode == 13 ){
		var sendMessage = $("#inputMessage").val();
		parseMessage( sendMessage );	
		$("#inputMessage").val("");		
		$("#inputMessage").focus();
	}
}
function joinChannel(channelName){
	if( $("#" + channelName).length == 0 ){
		console.log("입장할 채널 : " + channelName );
		socket.emit("join", {
			user : user,
			channel : channelName
		});		
		 var channelChatLog = 
				"<div id='" + channelName + "' class='channelLog'>" +
					"<div class='userList'>" +
						"<span>현재 접속자 : </span>" +
					"</div>" +
					"<div class='log'>" +
					"</div>" +
				"</div>";
		$("#channelTab").append( channelChatLog );
		$("#channelTab").tabs("add", "#" + channelName, channelName);
		$("#channelTab").tabs("option", "selected", $("#channelTab").tabs("length") ) ;
		console.log("tab length : " + $("#channelTab").tabs("length") );
	}else{
		log("이미 입장한 채널입니다.");
	}
}
function leaveChannel(channelName){
	socket.emit("leave", {
		channel : channelName
	});
	
	$("#" + getSelectedChannelName()).remove();
	$("#channelTab").tabs("remove", $("#channelTab").tabs("option", "selected"));
	
}
function parseMessage( message ){
	if( message.indexOf("/") == 0 ){
		console.log("message.indexOf('/') : " + message.indexOf("/"));
		var parseTarget = message.split(" ");
		if( parseTarget.length == 2 ){
			var runCommand = parseTarget[0].substring(1, parseTarget[0].length);
			var commandValue = parseTarget[1];			
			console.log("run command : " +  runCommand);
			
			switch(runCommand){
			case "join" :
				joinChannel(commandValue);
				break;
			case "leave" :
				leaveChannel(commandValue);
				break;
			}
			
		}else{
			log("잘못된 명령어입니다.");
		}
		
	}else{	
		if( message != "" ){
			socket.emit("chat", {
				msgType : "message",
				channel : getSelectedChannelName(),
				value : message
			});
		}
	}
}

function getSelectedChannelName(){
	return $(".ui-tabs-selected > a").text();
}

// 사용자 목록 갱신
function setUserList( channel, userList ){
	$("#" + channel + " > .userList").html("<span>현재 접속자 : </span>");
	for( var i = 0 ; i < userList.length; i++ ){
		userListAdd( channel, userList[i] );
	}
}	
function userListAdd( channel, userName ){
	var userListLayer = $("#" + channel + " > .userList");
	userListLayer.append("<span>" + userName + "</span> ");
}

function userListRemove( channel, userName ){
	var userListLayer = $("#" + channel + " > .userList");
	userListLayer.find(" > span").each(function(){
		if( $(this).text() == userName ){
			$(this).remove();
			return false;
		}
	});	
}
// 사용자 대화명 설정
function setUserName(){
	return getUserInputText("대화명을 입력하세요.");
}
function getJoinChannelName(){
	var channel = getUserInputText("접속할 대화 채널명을 입력하세요.");
	if( $("#" + channel).length > 0 ){
		alert("이미 접속한 채널입니다.");
		getJoinChannelName();
	}
	return channel;
}

function getUserInputText(inputMessage){
	var userInputText = prompt(inputMessage);
	if( userInputText == "" || 
			userInputText == undefined || 
			userInputText == null || 
			userInputText.indexOf(">") >= 0 || 
			userInputText.indexOf("<") >= 0 ){
		alert("입력이 잘못 되었습니다.");
		getUserInputText();
	}	
	return userInputText;
}

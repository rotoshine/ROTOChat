<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<title>rotochat</title>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="resources/css/chat.css"></link>
<link rel="stylesheet" href="resources/css/redmond/jquery-ui-1.8.16.custom.css"></link>
<script src="resources/js/jquery-1.6.2.min.js"></script>
<script src="resources/js/jquery-ui-1.8.16.custom.min.js"></script>
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
<script>	
	var user = new Object();
	var messageCount = 0;
	var socket = io.connect("http://localhost:3000");
	
	$(function(){		
		$("#channelTab").tabs();
		
		log("<b>서버에 접속 중입니다....잠시만 기다려주십시오....</b>", "system");
		
		socket.on("connect", function(){
			log("<b>서버 접속에 성공하였습니다.</b>", "system");
			if( !user.hasOwnProperty("userName") ){
				user.userName = setUserName();	
			}
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
			log("<b>서버와의 접속이 종료되었습니다.</b>", "system");
		});
		
		
		var windowHeight =  $(window).height() - 120;
		var windowWidth = $(window).width() - 50;
		$(".channelLog").css("height", windowHeight + "px");
		$(".log").css("height", (windowHeight - 20 )+ "px");	
		$(".channelLog").css("width", windowWidth - 50 + "px");
		
		
		$(window).resize(function(){
			var windowResizeHeight = $(window).height() - 120;
			var windowResizeWidth = $(window).width() - 50;
			$(".channelLog").css("height", windowResizeHeight + "px");
			$(".log").css("height", (windowResizeHeight - 20 )+ "px");	
			$(".channelLog").css("width", windowResizeWidth + "px");
	//		$("#channelInfoLayer").dialog("option", "height", windowResizeHeight);			
		});
		
		/* 	$("#channelInfoLayer").dialog({
			title			: "접속자 정보",
			position	: "right",
			width		: "27%",
			height	: windowHeight
		}); */
		
		// 엔터키 누르면 메시지 보내기
		$("#inputMessage").keydown(function(e){
			ifKeycodeIsEnterkeyThenSendMessage(e.keyCode);
		});
	});
	
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
			sendMessage();
		}
	}
	function joinChannel(channelName){
			
		console.log("입장할 채널 : " + channelName );
		socket.emit("joinChannel", {
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
		$("#channelTab").tabs("option", "selected", $("#channelTab").tabs("option", "selected") ) ;
	}
	function sendMessage(){
		var sendMessage = $("#inputMessage").val();
		var msgType = parseMessageType( sendMessage );
		console.log( "메시지타입 : " + msgType );
		if( sendMessage != "" ){
			socket.emit(msgType, {
				msgType : "message",
				channel : getSelectedChannelName(),
				value : sendMessage
			});
		}
		$("#inputMessage").val("");		
		$("#inputMessage").focus();
	}
	function parseMessageType( message ){
		if( message.indexOf("/") == 0 ){
			var parseTarget = message.split(" ");
			if( parseTarget == 2 ){
				return parseTarget[0].substring(0, parseTarget[1]);
			}
		}
		
		return "chat";
	}
	
	function getSelectedChannelName(){
		return $(".ui-tabs-selected > a").text();
	}
	
	// 사용자 목록 갱신
 	function setUserList( channel, userList ){
	/* 	//$('#totalUserCount').text( userList.length );
		var userListLayer = $("#" + channel + " > .userList");
		userListLayer.html("");
		for( var i = 0; i < userList.length; i++ ){
			userListLayer.append( '<span>' +  userList[i] + '</span><br>');
		} */
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
	
</script>
</head>
<body>
	<div id="chatLayer" >
		<div id="chatLogLayer" >
			<div id="channelTab">
				<ul>
					<li>
						<a href="#system">System</a>
					</li>
				</ul>
				<div id="system" class="channelLog">
					<div class="log">	
					</div>					
				</div>			
			</div>
			<div id="inputLayer" style="height:20px">
				<input type="text" id="inputMessage" value="" >
			</div>
		</div>
		<!-- <div id="channelInfoLayer">
			<div id="nowUserCountLayer">접속자 수 : <span id="totalUserCount">0</span></div>
			<div id="userList"></div>
		</div> -->
	</div>											
</body>
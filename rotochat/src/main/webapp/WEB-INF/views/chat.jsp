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
<script src="http://wemakeprogram.net:3000/socket.io/socket.io.js"></script>
<script>
	var user = new Object();
	var messageCount = 0;
	var log = function(s){	
		$("#chatLog").append(s + "<br>" );
		messageCount++;
		// 스크롤 맨 아래로 내리기
		$("#chatLog").scrollTop( messageCount * 20 );
				
	}; 
	log("<b>서버에 접속 중입니다....잠시만 기다려주십시오....</b>");
	
	var socket = io.connect("http://wemakeprogram.net:3000");
	
	socket.on('connect', function(){
		log("<b>서버 접속에 성공하였습니다.</b>");
		user.userName = setUserName();
		socket.emit("setUserInfo", {
			user : user,
			chatRoomName : "${chatRoomName}"
		});		

	});
	socket.on("join", function(msgObject){
		log("<b>" + msgObject.joinUserName + "님이 접속하셨습니다.");
		updateUserList( msgObject.userList );	
	});
	socket.on("out", function(msgObject){
		log("<b>" + msgObject.outUserName + "님이 나가셨습니다.");
		// 접속자 목록에서 나간 사람을 제거
		updateUserList(msgObject.userList);
	});
	socket.on("chat", function(msgObject){		
		var chatMessage = "<span>" + msgObject.userName + " : "  + msgObject.msg + "</span>";
		log(chatMessage);		
	});
	
	socket.on('disconnect', function(){
		log("<b>서버와의 접속이 종료되었습니다.</b>");
	});
	
	// 화면이 렌더링된 이후 처리되는 이벤트로, 전송 버튼 클릭 시의 처리를 합니다.
	$(function(){
					
		// 다이얼로그 생성
		$("#chatLogLayer").dialog({
			width		: "65%",
			height	: "600",
			position	: "left",
			title			: "${chatRoomName}"
		});
		
		$("#chatRoomInfoLayer").dialog({
			title			: "접속자 정보",
			position	: "right",
			width		: "27%",
			height	: "600"
		});
		
		// 엔터키 누르면 메시지 보내기
		$("#inputMessage").keydown(function(e){
			ifKeycodeIsEnterkeyThenSendMessage(e.keyCode);
		});
	});
	
	function ifKeycodeIsEnterkeyThenSendMessage(keyCode){
		if( keyCode == 13 ){
			sendMessage();
		}
	}
	
	function sendMessage(){
		var sendMessage = $("#inputMessage").val();
		if( sendMessage != "" ){
			socket.emit("chat", {
				msgType : "message",
				value : sendMessage
			});
		}
		$("#inputMessage").val("");		
		$("#inputMessage").focus();
	}
	
	
	// 사용자 목록 갱신
	function updateUserList( userList ){
		$('#totalUserCount').text( userList.length );
		$('#userList').html("");
		for( var i = 0; i < userList.length; i++ ){
			$('#userList').append( '<span>' +  userList[i] + '</span><br>');
		}
	}
	
	// 사용자 대화명 설정
	function setUserName(){
		var userName = prompt("사용자 명을 입력하세요.");
		if( userName == '' ){
			alert("잘못된 이름입니다.");
			setUserName();
		}
		userName = userName.split("<").join("").split(">").join("");
		return userName;
	}
	
	
</script>
</head>
<body>
	<section id="chatLayer" >
		<section id="chatLogLayer" >
			<section id="chatLog" style="height:500px;border: 1px solid black"></section>
			<section id="inputLayer" style="height:20px">
				<input type="text" id="inputMessage" value="" >
			</section>
		</section>
		<section id="chatRoomInfoLayer">
			<div id="nowUserCountLayer">접속자 수 : <span id="totalUserCount">0</span></div>
			<div id="userList"></div>
		</section>
	</section>											
</body>
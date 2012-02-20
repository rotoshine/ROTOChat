Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

window.getHeight = function(){
	return $(window).height() - 120;
};
window.getWidth = function(){
	return $(window).width() - 100;
};


// 키코드 관련 객체 정의
var KeyCode = {
	arrowUp : 38,
	arrowDown : 40,
	isArrowUpOrDown : function( keyCode ){
		return this.arrowUp == keyCode || this.arrowDown == keyCode;
	}
};

// 채널 오브젝트
var Channel = {
	join : function( channelName ){
		if( channelName == undefined ){
			channelName = getJoinChannelName();
		}
		if( $("#" + channelName).length == 0 ){
			socket.emit("join", {
				user : user,
				channel : channelName
			});		
			 var channelChatLog = 
					"<div id='" + channelName + "' class='channelLog' style='width:" + window.getWidth() + "px;height:" + window.getHeight() + "px;'>" +
						"<div class='userList'>" +
							"<span>현재 접속자 : </span>" +
						"</div>" +
						"<div class='log' style='width:" + window.getWidth() + "px;height:" + (window.getHeight() - 20) + "px;'>" +
						"</div>" +
					"</div>";
			$("#channelTab").append( channelChatLog );
			$("#channelTab").tabs("add", "#" + channelName, channelName);
			this.activateLastTab();
			
		}else{
			log("이미 입장한 채널입니다.");
		}
	},
	leave : function( channelName ){
		if( channelName == undefined ){
			channelName = getSelectedChannelName();
		}
		socket.emit("leave", {
			channel : channelName
		});
		
		$("#" + getSelectedChannelName()).remove();
		$("#channelTab").tabs("remove", $("#channelTab").tabs("option", "selected"));
		
	},
	
	activateLastTab : function(){
		$("#channelTab").tabs("option", "selected", $("#channelTab").tabs("length") - 1) ;
	},
};
var SystemUtil = {
	addInfo : function(type, infoId, clickCallback){
		$("#now" + type + "List").append(
				"<div id='" + infoId + "ChannelInfo' class='" + type + "Info'>" + infoId + "</div>"
		);
		
	},
	addUser : function(userName){
		this.addInfo("User", userName, function(){
			alert("유저 클릭");
		});
	},
	addChannel : function(channelName){
		this.addInfo("Channel", channelName, function() {
			$("#" + channelName +"ChannelInfo").hover(
				function(){
					$(this).addClass("channelListElementHover");
				}, 
				function(){
					$(this).removeClass("channelListElementHover");
				}
			);
			$("#" + channelName +"ChannelInfo").click(function(){
				Channel.join(channelName);
			});
		});		
	},
	toSystemMessage : function( message ){
		return "<span class='systemMessage'>" + message + "</span>";
	}
};

var user = new Object();
var socket = io.connect("http://localhost:3000");
socket.createUser = function(){
	user.userName = setUserName();
	this.emit("createUser", {
		user : user
	});
};

// 메시지 오브젝트
var inputMessage = {
	inputLog : new Array(),
	nowLogCursor : -1,
	add : function( message ){
		this.inputLog.push( message );
		this.nowLogCursor = this.getLogEndCursor();
	},
	getLogSize : function(){
		return this.inputLog.length;
	},
	getCursorPrevMessage : function(){
		if( this.nowLogCursor == -1 ){
			return;
		}
		else if(this.nowLogCursor > -1 && this.nowLogCursor <= this.getLogEndCursor()){
			return this.inputLog[--this.nowLogCursor];
		}else{
			return this.inputLog[0];
			
		}
	},
	getLogEndCursor : function(){
		return this.getLogSize() - 1;
	},
	getCursorNextMessage : function(){
		if(this.nowLogCursor == this.getLogEndCursor()){
			return "";
		}else if(this.nowLogCursor < this.getLogEndCursor()){
			return this.inputLog[++this.nowLogCursor];
		}else{
			return this.inputLog[this.nowLogCursor];
		}
	}
};
$(function(){		
	$("button").button();
	$("#channelJoinButton").click(function(){
		Channel.join();
	});
	$("#channelTab").tabs();
	$("#channelTab").bind("tabsshow", function(event, ui){
		logScroll( $(ui.panel).attr("id") );
		$("#inputMessage").focus();
	});
	
	resizeWindow();
	
	$(window).resize(function(){
		resizeWindow();	
		logScroll();
	});
	
	log( SystemUtil.toSystemMessage("서버에 접속 중입니다....잠시만 기다려주십시오....") );
	
	// 서버 연결 성공 시
	socket.on("connect", function(){
		log( SystemUtil.toSystemMessage("서버 접속에 성공하였습니다.") );
		
		// 사용자 목록과 채널 목록을 받아온다.
		socket.emit("getUserList");
		socket.emit("getChannelList");
		
		if( !user.hasOwnProperty("userName") ){
			socket.createUser(user);
		}
	});
	
	// 사용자 목록을 송신 받았을 경우
	socket.on("sendUserList", function(message){
		$("#nowUserList").html("");
		var userList = message.userList;
		for( var userName in userList ){
			$("#nowUserList").append("<div id='" + userName + "UserInfo' class='userInfo'>" + userName + "</div>");
		}
		
	});
	
	// 채널 목록을 송신 받았을 경우
	socket.on("sendChannelList", function(message){
		$("#nowChannelList").html("");
		var channelList = message.channelList;
		for( var channelName in channelList ){
			SystemUtil.addChannel( channelName );			
		}
	});
	
	socket.on("alreadyUseUserName", function(){
		alert("이미 사용 중인 대화명입니다.");
		socket.createUser(user);
	});
	
	socket.on("createUserComplete", function(msgObject){
		Channel.join();
	});
	
	socket.on("createUser", function(data){
		$("#nowUserList").append( "<div id='" + data.user + "UserInfo'>" + data.user + "</div>");
	});
	
	socket.on("removeUser", function(data){
		var removeUserInfo = $("#" + data.user + "UserInfo");
		if( removeUserInfo.length > 0 ){
			removeUserInfo.remove();
		}
	});
	
	socket.on("createChannel",function(msgObject){
		SystemUtil.addChannel(msgObject.channel);
	});
	
	socket.on("removeChannel", function(msgObject){
		var removeChannelInfo = $("#" + msgObject.channel + "ChannelInfo");
		if( removeChannelInfo.length > 0 ){
			removeChannelInfo.remove();
		}
	});
	
	socket.on("join", function(msgObject){
		log( "<span class='systemMessage'>" + msgObject.joinUserName + "님이 접속하셨습니다.</span>", msgObject.channel);
		setUserList( msgObject.channel, msgObject.userList );	
	});
	
	socket.on("leave", function(msgObject){
		log("<span class='systemMessage'>" + msgObject.leaveUserName + "님이 나가셨습니다.</span>", msgObject.channel);
		
		// 접속자 목록에서 나간 사람을 제거
		userListRemove( msgObject.channel , msgObject.leaveUserName);			
	});
	
	socket.on("chat", function(msgObject){		
		var receiveDate = new Date(msgObject.receiveDate);
		var chatMessage = msgObject.msg;
		
		// 자동링크 부분 현재는 하드코딩 되어있는데 나중에 별도의 패턴으로 분리할 것
		if( chatMessage.indexOf("http://") >= 0 || chatMessage.indexOf("www.") >= 0 ){
			chatMessage = "<a href='" + chatMessage + "' target='_blank'>" + chatMessage + "</a>";
		}
		var chatMessageTag = 
				"<span class='receiveDate'>[" + receiveDate.format("HH:mm") + "]</span>" +
				"<span class='userName'>&lt;" + msgObject.userName + "&gt; " +
				"<span class='chatMessage' style='color:" + msgObject.fontColor +"'>"  + chatMessage + "</span>";
		log(chatMessageTag, msgObject.channel);		
	});
	
	socket.on("disconnect", function(){
		log("<span class='systemMessage'>서버와의 접속이 종료되었습니다.</span>");
	});
	
	
	
	// 엔터키 누르면 메시지 보내기
	$("#inputMessage").keydown(function(e){
		ifKeycodeIsEnterkeyThenSendMessage(e.keyCode);
		ifKeycodeIsArrowThenPrevInputMessageLoad(e.keyCode);
	});

	$("#fontColor").click(function(){
		$("#colorPicker").dialog("open");
	});
	// colorPicker 다이얼로그 버튼 이벤트 재정의
	$("#colorPicker").dialog("option", "buttons", {
		"확인" : function(){
			var selectedColorCode = $("#selectedColor").css("background-color");
			$("#fontColor").css("background-color", selectedColorCode);
			$(this).dialog("close");
			$("#inputMessage").focus();
		},
		"닫기" : function(){
			$(this).dialog("close");
			$("#inputMessage").focus();
		}
	});
});


function ifKeycodeIsArrowThenPrevInputMessageLoad(keyCode){
	switch(keyCode){
	case KeyCode.arrowUp :
		$("#inputMessage").val( inputMessage.getCursorPrevMessage() );
		break;
	case KeyCode.arrowDown :
		$("#inputMessage").val( inputMessage.getCursorNextMessage() );
		break;
	}
}

function resizeWindow(){
	var windowHeight =  window.getHeight() - 10;
	var windowWidth = window.getWidth();
	$(".channelLog").css("width", windowWidth  + "px");
	$(".channelLog").css("height", windowHeight + "px");
	$(".log").css("width", windowWidth + "px");
	$(".log").css("height", (windowHeight - 20 )+ "px");	
}

function log(message, channel){
	if( channel == undefined ){
		channel = getSelectedChannelName();
	}
		
	$("#" + channel + " > .log").append(message + "<br>" );
	logScroll(channel);
}; 

function logScroll( channel ){
	if( channel == undefined ){
		channel = getSelectedChannelName();
	}
	// 스크롤 맨 아래로 내리기
	var messageCount = $("#" + channel + " > .log > .userName").length;
	$("#" + channel + " > .log").scrollTop(  messageCount * 30 );
}

function ifKeycodeIsEnterkeyThenSendMessage(keyCode){
	if( keyCode == 13 ){
		var sendMessage = $("#inputMessage").val();
		if( sendMessage != "" && sendMessage != undefined ){
			socket.emit("chat", {
				msgType : "message",
				fontColor : $("#fontColor").css("background-color"),
				channel : getSelectedChannelName(),
				value : sendMessage
			});
			inputMessage.add( sendMessage );
			$("#inputMessage").val("");		
			$("#inputMessage").focus();
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

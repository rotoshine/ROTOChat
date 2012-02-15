<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<title>rotochat</title>
<head>
<meta charset="utf-8" content="">
<link rel="stylesheet" href="resources/css/chat.css"></link>
<link rel="stylesheet" href="resources/css/redmond/jquery-ui-1.8.16.custom.css"></link>
<script src="resources/js/jquery-1.6.2.min.js"></script>
<script src="resources/js/jquery-ui-1.8.16.custom.min.js"></script>
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
<script src="resources/js/chat.js"></script>	
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
					<div>
						시스템 관련 기능을 넣을 부분	
					</div>					
				</div>			
			</div>
			<div id="inputLayer" style="height:20px">
				<select id="fontColor">
					<option value="black" style="color:black" selected="selected">BLACK</option>
					<option value="red" style="color:red">RED</option>	
					<option value="green" style="color:green">GREEN</option>	
					<option value="blue" style="color:blue">BLUE</option>									
				</select>
				<input type="text" id="inputMessage" value="" >
			</div>
		</div>
	</div>											
</body>
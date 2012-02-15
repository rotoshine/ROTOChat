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
					<div class="log">	
					</div>					
				</div>			
			</div>
			<div id="inputLayer" style="height:20px">
				<input type="text" id="inputMessage" value="" >
			</div>
		</div>
	</div>											
</body>
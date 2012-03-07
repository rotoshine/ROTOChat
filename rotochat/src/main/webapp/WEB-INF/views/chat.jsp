<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<title>rotochat</title>
<head>
<meta charset="utf-8" content="">
<link rel="stylesheet" href="resources/css/colorPicker.css"></link>
<link rel="stylesheet" href="resources/css/chat.css"></link>
<link rel="stylesheet" href="resources/css/custom-theme/jquery-ui-1.8.16.custom.css"></link>
<link rel="stylesheet" href="resources/bootstrap/bootstrap.css"></link>
<script src="resources/js/jquery-1.6.2.min.js"></script>
<script src="resources/js/jquery-ui-1.8.16.custom.min.js"></script>
<script src="http://127.0.0.1:3000/socket.io/socket.io.js"></script>
<script src="resources/js/colorPicker.js"></script>	
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
						<div>
							현재 접속자 목록
						</div>
						<div id="nowUserList">
						</div>	
					</div>
					<div>
						<div>
							현재 생성된 채널 목록
						</div>
						<div id="nowChannelList">
						</div>
					</div>
					<div>
						<button id="channelJoinButton">채널 입장</button>
					</div>					
				</div>			
			</div>
			<div id="inputLayer" style="height:20px">
				<div id="fontColor" style="float:left;margin-top:5px;margin-right:5px;cursor: pointer;"></div>
				<input type="text" id="inputMessage" value=""  style="float: none;">
			</div>
		</div>
	</div>												
	
	<!-- color picker -->
	<div id="colorPicker">
		<table>
			<tr>
				<td>
					<table>
						<tr>
							<td>
								<div id="redColorPickerSlider" class="colorPickerSlider" ref="redColorCode"></div>
							</td>
							<!-- <td>
								<input type="text"  id="redColorCode" class="colorCode" size="3" maxlength="3" value="255">
							</td> -->
						</tr>
						<tr>
							<td>
								<div id="blueColorPickerSlider" class="colorPickerSlider" ref="blueColorCode" ></div>
							</td>
							<!-- <td>
								<input type="text"  id="blueColorCode"  class="colorCode" size="3" maxlength="3" value="255">
							</td> -->
						</tr>
						<tr>
							<td>
								<div id="greenColorPickerSlider" class="colorPickerSlider" ref="greenColorCode" ></div>
							</td>
						<!-- 	<td>
								<input type="text"  id="greenColorCode"  class="colorCode" size="3" maxlength="3" value="255">
							</td> -->
						</tr>
					</table>
			</td>
			<td>			
				<div id="selectedColor"></div>
			</td>
		</table>
	</div>
</body>
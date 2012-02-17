// 색상 선택 오브젝트 객체
// jquery ui의 slider와 dialog에 의존함
var ColorPicker = {
	theme : "redmond",
	rendering : function(targetElement){
		//TODO HTML 스크립트를 불러와서 append 시켜주는 방식으로 바꿀 것.		
	}
};
$(function(){
	$("#colorPicker").dialog({
		autoOpen : false,
		title : "색상 선택",
		width : 330,
		height : 245,
		buttons : {
			"확인" : function(){
				
			},
			"닫기" : function(){
				$(this).dialog("option", "close");
			}
		},
		resizable : false,
		modal : true
	});
	$(".colorPickerSlider").slider({
		min : 0,
		max : 255,
		value : 0
	});
	
	$(".colorPickerSlider").bind("slide", function(event, ui){
	//	var referenceObjectID = $(this).attr("ref");
		//var sliderValue = $(this).slider("option", "value");
	//	$("#" + referenceObjectID).val(sliderValue);
		
		// color change
		
		var colorCodes = new Array();
		$(".colorPickerSlider").each(function(){
			var colorCode = parseInt( $(this).slider("option", "value"), 10).toString(16);
			if( colorCode < 10 ){
				colorCode = "0" + colorCode;
			}
			
			colorCodes.push( colorCode );
		});
		
		if( colorCodes.length == 3 ){
			var colorCode = "#" + colorCodes[0] + colorCodes[1] + colorCodes[2];
			$("#selectedColor").css("background-color", colorCode);
		}else{
			alert("오류가 있습니다. 개발자에게 알려주세요!");
		}
	});
	
	/* 
	$(".colorCode").keydown(function(){
		$(".colorPickerSlider").trigger("slide");
	}); */
});
// jquery ui의 dialog를 추상화한 객체.
var Prompt = function(id, parameters){
	this.id = id;
	this.content = "";
	
	if( parameters.hasOwnProperty("questionText")){
		this.questionText = parameters.questionText;
	}
	
	var tag = 
		"<div id='" + id + "'>" + 
			"<span class='question'>" +  this.questionText + "</span>" + 
			"<br>" +
			"<input type='text' class='answer'>" +
		"</div>";
	
	$("body").append(tag);
	$("#" + id).dialog( parameters );
	this.window = $("#" + id);

	var buttons = new Object();
	if( parameters.hasOwnProperty("okButtonCallback") ){
		buttons = {
				text : "확인",
				click : parameters.okButtonCallback
		};
	}

	this.window.dialog("option", "buttons", buttons);
	$("#" + id + " > .answer").keypress(function(e){
		if(e.keyCode == 13){
			var okButton = $("#" + id).dialog("option", "buttons");
			$(okButton).click();
		}
	});
	return this.window;
};

Prompt.prototype.setQuestionText = function( questionText ){
	$("#" + this.id + " > .question").text( questionText );
};

Prompt.prototype.getAnswer = function(){
	return $("#" + this.id + "> .answer"),val();
};

Prompt.prototype.show = function(){
	this.window.dialog("open");
};

Prompt.prototype.hide = function(){
	this,window.dialog("close");
};



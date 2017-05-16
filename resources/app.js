/*
	Cloud Template 1.0
	Author: Rachit Garg <rachitgarg5@yahoo.com>
*/
$(document).ready(() => {
	/*
		Configuring the speech synthesis object for voice
	*/
	let msg = new SpeechSynthesisUtterance();
	let voices = window.speechSynthesis.getVoices();
	msg.voiceURI = 'native';
	msg.lang = 'en-US';
	msg.volume = .5; // 0 to 1
	msg.rate = 1; // 0.1 to 10
	msg.pitch = 1; //0 to 2

	let ctrlKey 			= 17;		//used to speak out the content of template
	let altKey 				= 18;		//Used to save the screenshot of template
	let escKey				= 27;		//Used to popup the input for saving
	let tabKey 				= 9;		//char code for TAB key
	let enterKey 			= 13;		//char code for ENTER key
	let deleteKey			= 46;		//Used to popup the saved searches dropdown
	let canvasId 			= "thinkingCloud";
	let downloadId 			= "download";
	let captureId 			= "capture";
	let downloadElm 		= document.getElementById(downloadId);
	let captureElm 			= document.getElementById(captureId);
	let fileName 			= "thinking-cloud.png";

	/*
		Toggle the template list on press of attached key
	*/
	function _toggleSavedTemplateList(event){
		if($("#savedTemplateList").is(":visible")) {
			$("#savedTemplateList").hide();
			$("#commonObjA").show().focus();
			event.stopPropagation();
		} else{
			$("#saveTemplateInput").val("").hide();
			$("#savedTemplateList").show().focus();
			msg.text = "Search a saved template...";
			speechSynthesis.speak(msg);
		}
	}

	/*
		Toggle the iput box used for saving templates
	*/
	function _toggleTemplateSaveInput(event){
		if($("#saveTemplateInput").is(":visible")) {
			$("#saveTemplateInput").val("").hide();
			msg.text = "SAVE aborted.";
			speechSynthesis.speak(msg);
			event.stopPropagation();
		} else{
			$("#savedTemplateList").hide();
			$("#saveTemplateInput").show().focus();
			msg.text = $("#saveTemplateInput").attr("aria-label");
			speechSynthesis.speak(msg);
		}
	}

	/*
		Handler responsible for speaking out the cloud label
	*/
	function _speakCloudLabel(event){
		let value = $(":focus").attr("aria-label");
		if(value){
			msg.text = value;
			speechSynthesis.speak(msg);
		}
	}

	/*
		Handler responsible for speaking out the content inside the text cloud
		on click of respective attached key
	*/
	function _speakCloudContent(event){
		let elm = $("#"+event.currentTarget.id);
		let value = elm.val();
		if ( event.which === ctrlKey ) {
			msg.text = value;
			//msg.onend = function(event) {
			//	console.log('Finished in ' + event.elapsedTime + ' seconds.');
			//};
			speechSynthesis.speak(msg);
		}
	}

	/*
		Generating a map of cloud template values and saving it to local storage object
	*/
	function _saveCloudTemplate(){
		if(event.which === enterKey){
			let elm = $("#"+event.currentTarget.id);
			let templateName = elm.val().toLowerCase();
			if(templateName.length){
				msg.text = "Saving " + templateName;
				speechSynthesis.speak(msg);
				let templateMap = {};
				$(".cloud-input").each(function(){
					templateMap[$(this).attr("id")] = $(this).val();
				});
				$("#saveTemplateInput").val("").hide();
				if(window.localStorage){
					localStorage.setItem(templateName, JSON.stringify(templateMap));
				} else{
					msg.text = "Sorry! You do not have storage capability in your browser.";
					speechSynthesis.speak(msg);
				}
			} else{
				msg.text = "Please type in a template name.";
				speechSynthesis.speak(msg);
			}
		}
		msg.text = "";
	}

	/*
		Load the desired template on select of option
	*/
	function _selectSavedTemplate(event){
		let selectedTemplateName = $('#savedTemplateList').find(":selected").text();
		msg.text = selectedTemplateName;
		speechSynthesis.speak(msg);
		let selectedTemplateMap;
		if(window.localStorage){
			if(window.localStorage[selectedTemplateName]){
				selectedTemplateMap = JSON.parse(window.localStorage[selectedTemplateName]);
				$(".cloud-input").each(function(){
					let value = selectedTemplateMap[$(this).attr("id")];
					$(this).val(value);
				});
			} else{
				console.warn("Please select a valid template.");
				$(".cloud-input").each(function(){
					$(this).val("");
				});
			}
		} else{
			console.warn("Sorry! You do not have local storage in your browser.");
			return false;
		}
	}

	/*
		Responsible for saving screenshot of current browser tab
	*/
	function _performCaptureScreen(event){
		html2canvas(captureElm, {
			onrendered: (canvas) => {
				canvas.setAttribute("id", canvasId);
				document.body.appendChild(canvas);
				downloadElm.setAttribute("href",document.getElementById(canvasId).toDataURL());
				downloadElm.setAttribute("download", fileName);
				downloadElm.click();
				document.getElementById(canvasId).outerHTML = "";
				delete document.getElementById(canvasId);
			}
		});
	}

	/*
		Check if anything is already stored in the LocalStorage
		If yes, Fetch all these values and generate a dropdown list
	*/
	function _init(templateName){
		let storedTemplateNames;
		if(window.localStorage){
			storedTemplateNames = Object.keys(window.localStorage);
			if(storedTemplateNames.length > 0){
				for(let i = 0; i < storedTemplateNames.length; i++){
					$("<option>").text(storedTemplateNames[i]).attr("aria-label", storedTemplateNames[i]).appendTo("#savedTemplateList");
				}
			} else{
				console.warn("No templates saved yet.");
			}
		} else{
			console.log("Sorry! You do not have local storage in your browser.");
			return false;
		}
	}

	/*
		Making the tabbing of text clouds cyclic
		The focus will come to first cloud after the last
	*/
	$("form").each(function(){
		let list  = $(this).find("*[tabindex]").sort((a,b) => { return a.tabIndex < b.tabIndex ? -1 : 1; }),
			first = list.first();
		list.last().on('keydown', (event) => {
			if( event.keyCode === tabKey ) {
				first.focus();
				return false;
			}
		});
	});

	/*
		Attaching all the event handlers on respecting elements
	*/
	$(document).on("keyup", (event) => {
		if ( event.which === altKey) _performCaptureScreen(event);
		if ( event.which === escKey) _toggleTemplateSaveInput(event);
		if ( event.which === deleteKey) _toggleSavedTemplateList(event);
	});
	$(".cloud-input").on("keyup", (event) => { _speakCloudContent(event) });
	$(".cloud-input").on("focus", (event) => { _speakCloudLabel(event) });
	$("#saveTemplateInput").on("keyup", (event) => { _saveCloudTemplate(event) });
	$("#savedTemplateList").on("change", (event) => { _selectSavedTemplate(event) });

	// Initialize the component
	_init();

});

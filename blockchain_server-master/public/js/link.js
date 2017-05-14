function ShowAjax(url1) {
	var url= contentPath+ url1;
	var xmlHttp = null;
	try {
		xmlHttp = new XMLHttpRequest();
	} catch (e) {
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	if (xmlHttp == null) {
		alert("Browser does not support HTTP Request");
		return;
	}
	
	xmlHttp.open("GET", url, false);
	xmlHttp.send(null);
	if (xmlHttp.readyState != 0 || xmlHttp.readyState == "complete") {
		var arr = eval(xmlHttp.responseText);
		return arr;
	}
}
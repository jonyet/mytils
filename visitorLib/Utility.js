"use strict"
var _ = require('underscore');

module.exports.execAsync = function(tasks, finished){
	var tasksCompleted = 0;
	tasks.forEach(function(task){
		var thisPtr = task.thisPtr || task;
		task.op.call(thisPtr, task.args, function(){
			if(++tasksCompleted === tasks.length){
				if(finished)
					finished();
			}	
		});
	});
}

module.exports.startsWithAny = function(s, vals){
	if(!s || !vals || vals.length == 0)
		return false;

	var formatted = s.trim().toLowerCase();
	return _.some(vals, function(val){
		return formatted.indexOf(val) == 0;
	});
}	

module.exports.parseUri = function(str) {
	var	o = {
			strictMode: false,
			key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
			q:   {
				name:   "queryKey",
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		},
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

module.exports.getUrlParameter = function(url, param){
	param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
	results = regex.exec(url);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

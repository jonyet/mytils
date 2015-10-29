"use strict";

module.exports = Link;

var urlUtility = require('url');
var _ = require('underscore');
var utility = require('./Utility');


function Link(href, target){
	this.href = href;
	this.target = target;
	this.validations = [];
}

Link.prototype.isHash = function(){
	return this.href && this.href.trim().indexOf('#') === 0;
}

Link.prototype.isJavaScript = function (){
	return this.href && this.href.trim().toLowerCase().indexOf('javascript') == 0;
}

Link.prototype.isEmpty = function(){
	return this.href && this.href.trim().length === 0;
}

Link.prototype.isMailTo = function(){
	return this.getFormattedHref().indexOf('mailto:') === 0;
}

Link.prototype.isTel = function(){
	return this.getFormattedHref().indexOf('tel:') === 0;
}

Link.prototype.getFormattedHref = function(){
	if(!this.href)
		return '';
	return this.href.trim().toLowerCase();
}

Link.prototype.getParameter = function(param){
	param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
	results = regex.exec(this.href);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

Link.prototype.getParameterOnRedirect = function(param){
	if(!this.redirectsTo)
		return '';

	param = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + param + "=([^&#]*)"),
	results = regex.exec(this.redirectsTo);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

Link.prototype.isResource = function(){
	var formatted = this.getFormattedHref();
	return formatted.indexOf('/') >= 0;
}

Link.prototype.getHost = function(){
	if(!utility.startsWithAny(this.href, ['http', 'www']))
		return '';
	var url = urlUtility.parse(this.href);
	if(!url)
		return '';
	return url.host;
}

Link.prototype.getCMP = function(){
	//do stuff
}

Link.prototype.resolve = function(url){
	if(!this.href)
		return '';
	var formatted = this.getFormattedHref();
	if(formatted.indexOf('http') === 0)
		return formatted;
	if(formatted.indexOf('www') === 0)
		return 'http://' + formatted;
	if(!this.isResource())
		return this.href;
	return urlUtility.resolve(url, this.href);
}

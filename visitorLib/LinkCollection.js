"use strict";

module.exports = LinkCollection;

var hyperquext = require('hyperquext');
var hyperquextDirect = hyperquext.decorators.hyperquextDirect;
var r = hyperquextDirect(hyperquext);
var _ = require('underscore');
var request = require('request');
var utility = require('./Utility');
var Link = require('./Link');

function LinkCollection(parent){
	this.parent = parent;
	this.links = [];
	this.parent.syncValidators = [];
	this.parent.asyncValidators = [];
	this.truthy = true;
}

LinkCollection.prototype.add = function(link){
	this.links.push(link);
}

LinkCollection.prototype.count = function(){
	return this.links.length;
}

LinkCollection.prototype.countUniqueUrls = function(){
	return this.getUniqueUrls().length;
}

LinkCollection.prototype.getUniqueUrls = function(){
	return _.uniq(_.pluck(this.links, 'href'));
}

LinkCollection.prototype.should = function(){
	this.truthy = true;
	return this;
}

LinkCollection.prototype.shouldNot = function(){
	this.truthy = false;
	return this;
}

LinkCollection.prototype.haveHostName = function(host){
	var self = this;
	var expect = self.truthy;
	this.parent.syncValidators.push(function(){
		console.log('>> Validating link host names are ' + host);
		self.links.forEach(function(link){
			var validation = {
				result: 'pass',
				detail: host,
				category: 'Host'
			}
			if((link.getHost() != host) == expect){
				validation.result = 'fail';
				console.log('FAIL: ' + link.href);
			}
			link.validations.push(validation);
		});
	});
	return this;
}

LinkCollection.prototype.beEmpty = function(){
	var self = this;
	var expect = !self.truthy;
	this.parent.syncValidators.push(function(){
		console.log('>> Verifying links are not empty');
		var failures = 0;
		self.links.forEach(function(link){
			var validation = {
				result: 'pass',
				category: 'Link'
			}
			if((!link.href || link.href.trim() === '') == expect){
				failures++;	
				validation.result = 'fail';
			}
			
		});
		if(failures > 0)
			console.log('>> ' + failures + ' failures');
	});
	return this;
}

LinkCollection.prototype.be = function(val){
	var self = this;
	var expect = !self.truthy;
	var speshal = [];
	this.parent.syncValidators.push(function(){
		console.log('>> Verifying links are not ' + val);
		self.links.forEach(function(link){
			var validation = {
				result: 'pass',
				category: 'Link'
			}
			if((link.href === val) === expect){ //fix this tomorrow, dummy
				if (val === '#'){
					speshal.push(link.href)
					if (speshal.length = 2){
						validation.result = 'fail';
						console.log('FAIL: ' + speshal.length + ' hrefs had value of "#", threshold is 1.');
					}
				} else {
					validation.result = 'fail';
					console.log('FAIL: ' + link.href);
				}
			}
			
		});
		
	});
	return this;
}

LinkCollection.prototype.mustBe = function(component, val){ //placeholder assertion for a component of the DOM
	var self = this;
	var expect = !self.truthy;
	this.parent.syncValidators.push(function(){
		console.log('>> Validating that ' + component + ' is ' + val);
			self.component(function(link){
				var validation = {
					result: 'pass',
					category: 'assertion'
				}
				if((component != val) === expect){ //in our case, email href must always === "#"
					validation.result = 'fail';
					console.log('FAIL: ' + component);
				}	
			});	
	return this;
	});
}

var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1588.0 Safari/537.36'
}

LinkCollection.prototype.beReachable = function(){
	var self = this;
	var expect = self.truthy;
	this.parent.asyncValidators.push(function(next){
		var linksValidated = 0;
		console.log('>> Validating link reachability');
		if(self.links.length === 0){
			if(next)
				next();
			return;
		}
		var urls = self.getUniqueUrls();	
		var validations = {};
		urls.forEach(function(url){
			if(url === ''){
					var validation = {
						result: 'fail',
						detail: 'Missing href',
						category: 'StatusCode'
					}
					validations[url] = validation;
				++linksValidated;
				return;
			}
			if(url.indexOf('http') != 0){
					var validation = {
						result: 'fail',
						detail: 'Invalid href: ' + url,
						category: 'StatusCode'
					}
					validations[url] = validation;
				++linksValidated;
				return;
			}
			r(url, {headers: headers, maxRedirects: 10}, function(error, response, html){	
			// request(url, function(error, response, html){	
				if(error){
					console.error(url + ' ERROR ' + error);
				}
				else{
					console.log(response.statusCode + ' ' + url);
					// console.log(data);
					var validation = {
						result: (response.statusCode === 200) ? 'pass' : 'fail',
						detail: response.statusCode,
						origin: url,
						destination: (response && response.request) ? response.request.href : url,
						category: 'StatusCode'
					}
					validations[url] = validation;

					if(response.statusCode != 200 === expect){
						console.log('FAIL:' + url);
					}
				}
				if(++linksValidated === urls.length){
					self.links.forEach(function(link){
						if(validations[link.href]){
							link.validations.push(validations[link.href]);
						}
					});
					next();
				}
				
			});
		});
	});
	return this;
}

 LinkCollection.prototype.haveParameterOnRedirect = function(params, client){
	var self = this;
	this.parent.syncValidators.push(function(){
		var linksThatRedirect = _.filter(self.links, function(link){
			var base = link.href.replace(/(http(s)?:\/\/)|(\/.*){1}/g, '');
			if (base == "www.facebook.com" ||
					base == "twitter.com" ||
					base == "plus.google.com" ||
					base == "www.youtube.com" ||
					base == "www.pinterest.com"
			) {
				return false;
			}

			var statusCodeValidation = _.findWhere(link.validations, {'category': 'StatusCode'});
			if(!statusCodeValidation)
				return false;

			var dest = statusCodeValidation.destination;
			if(!dest || link.href.toLowerCase() == dest.toLowerCase()){
				return false;
			}
			return true;

		});
		
		console.log('>> Verifying ' + linksThatRedirect.length + ' links have redirect parameter ');
		_.each(linksThatRedirect, function(link){
			var statusCodeValidation = _.findWhere(link.validations, {'category': 'StatusCode'});
			var dest = statusCodeValidation.destination;
			_.each(params, function(param){
				var paramValue = utility.getUrlParameter(dest, param); 
				var validation = {
						redirect: dest,
						parameter: param,
						category: 'ParameterOnRedirect'
					}
				var hasParameter = paramValue.length > 0;
				if(hasParameter){
					validation.result = 'pass';
					validation.detail = paramValue;
				}else{
					console.log('>> FAIL: Missing parameter ' + param);
					console.log(link.href);
					validation.result = 'fail';
					validation.detail = 'Missing parameter ' + param;
				}
				link.validations.push(validation);
			})
		});

	});
	return this;
}

LinkCollection.prototype.assert = function(next){
	this.parent.validate.call(this.parent, next);
}

LinkCollection.prototype.openNewTab = function () {
	var self = this
	this.parent.syncValidators.push(function(){
		// var urls = self.getUniqueUrls();
		_.each(self.links, function(link){
			var targetVal = link.target
			if(targetVal != "" && targetVal != null && targetVal != "undefined")
				targetVal = targetVal.trim()
			var newTab = (targetVal != "blank" || targetVal != "_blank")
			var validation = {
				result: "pass",
				target: targetVal,
				category: "openNewTab"
			}
			if(!newTab)
			{
				validation.result = "fail"
				console.log(">> "+link.href+" will not open in a new tab")
			}
			link.validations.push(validation)
		})
	})

	return this
		
}

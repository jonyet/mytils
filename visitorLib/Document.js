"use strict"

module.exports = Document;

var fs = require('fs');
var argv = require('yargs').argv;
if (argv.config === 'prod') {
    var config = JSON.parse(fs.readFileSync((__dirname + "/NIMAPMailOptionsProd.json"), "utf-8"));
}
else {
    var config = JSON.parse(fs.readFileSync((__dirname + "/NIMAPMailOptions.json"), "utf-8"));
}
var request = require('request');
var path = require('path');
var urlUtility = require('url');
var cheerio = require('cheerio'); //html jquery-style parser
var _ = require('underscore');
var utility = require('./Utility');
var LinkCollection = require('./LinkCollection');
var Link = require('./Link');

function Document(message){
	// this is also from where the mongo obj is built
	// id, url, html, subj are all important. also need campaign and type, at least.
	this.email = message;
	this.id = message.messageId;
	this.url = process.argv[2];
	// this.syncValidators = [];
	// this.asyncValidators = [];
	this.links = new LinkCollection(this);
	// this.images = new ImageCollection(this);
	// this.validations = [];
}


Document.prototype.load = function(url){
	var self = this;
	var $ = cheerio.load(url);
	var a = $('a');
	_.each(a, function (tag){
		var href = $(tag).attr('href');
		var target = $(tag).attr('target');
		self.links.add(new Link(href, target));
	});
	console.log('>> ' + self.links.count() + ' urls (' + self.links.countUniqueUrls() + ' unique)');

	if(next)
		next.call(self);
	return this;
}

Document.prototype.validate = function(next){
	var self = this;
	console.log('>> Validating ' + this.id);
	if(this.asyncValidators.length === 0){
		self.syncValidators.forEach(function(validator){
			validator();
		});	
		if(next)
			next.call(self);
		return this;
	}
	var asyncCompleted = 0;
	this.asyncValidators.forEach(function(asyncValidator){
		asyncValidator(function(){
			if(++asyncCompleted == self.asyncValidators.length){
				self.syncValidators.forEach(function(validator){
					validator();
				});	
				if(next)
					next.call(self);
			}
		});
	});
	return this;
}

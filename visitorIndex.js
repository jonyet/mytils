"use strict";

var fs = require('fs');
var cheerio = require('cheerio'); //html jquery-style parser
var _ = require('underscore');
var phantom = require('phantom');
var urlUtility = require('url');
var LinkCollection = require('./visitorLib/LinkCollection');
var Link = require('./visitorLib/Link');
var request = require('request');

console.log('>> Starting test');

var url = process.argv[2]

request(url, function(err, res){
	if(err) {
		console.log(err)
	}
	var html = res.body;
	var test = {}
	var links = new LinkCollection(test);
	var $ = cheerio.load(html);
	var a = $('a');
	_.each(a, function (tag){
		var href = $(tag).attr('href');
		var absoluteUrl = href && href.length > 0 ? urlUtility.resolve(url, href) : '';
		var alt = $(tag).attr('alt');
		links.add(new Link(absoluteUrl, alt));
	});
	console.log('>> ' + links.count() + ' urls (' + links.countUniqueUrls() + ' unique)');
	console.log(test);
	console.log(links);
});	

"use strict";

var fs = require('fs');
var cheerio = require('cheerio'); //html jquery-style parser
var _ = require('underscore');
var phantom = require('phantom');
var urlUtility = require('url');
var LinkCollection = require('./visitorLib/LinkCollection');
var Link = require('./visitorLib/Link');
var request = require('request'),
    username = undefined,
    password = undefined,
    base = process.argv[2],
    //for use with authentication (not the most secure method)
    // url = "http://" + username + ":" + password + base + ".com";
    //for use without authentication
    url = "http://" + base + ".com";

console.log('>> Starting test');
console.log(url);

request(
    {
        url : url
    },
    function (err, res, body) {
        if(err) {
		console.log(err)
	}
	var html = body;
	// console.log(body);
	var test = {}
	var links = new LinkCollection(test);
	var $ = cheerio.load(html);
	var a = $('a');
	_.each(a, function (tag){
		var href = $(tag).attr('href'),
			absoluteUrl = href && href.length > 0 ? urlUtility.resolve(url, href) : '',
			clas = $(tag).attr('class'),
			target = $(tag).attr('target');
		links.add(new Link(absoluteUrl, alt, clas, target));
	});
	// var link = $('link');
	// _.each(link, function (tag){
	// 	var href = $(tag).attr('href'),
	// 		absoluteUrl = href && href.length > 0 ? urlUtility.resolve(url, href) : '',
	// 		alt = $(tag).attr('alt'),
	// 		clas = $(tag).attr('class'),
	// 		target = $(tag).attr('target');
	// 	links.add(new Link(absoluteUrl, alt, clas, target));
	// });
	// var form = $('form');
	// _.each(form, function (tag){
	// 	var action = $(tag).attr('action'),
	// 		// absoluteUrl = action && action.length > 0 ? urlUtility.resolve(url, action) : '',
	// 		id = $(tag).attr('id'),
	// 		clas = $(tag).attr('class'),
	// 		target = $(tag).attr('target');
	// 	links.add(new Link(action, id, clas, target));
	// });

	console.log('>> ' + links.count() + ' urls (' + links.countUniqueUrls() + ' unique)');
	// console.log(test);
	console.log(links);
    }
);

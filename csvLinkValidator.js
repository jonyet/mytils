"use strict"

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
// var hyperquest = require('hyperquest');
var hyperquext = require('hyperquext');
var hyperquextDirect = hyperquext.decorators.hyperquextDirect;
var s = hyperquextDirect(hyperquext);
var r = hyperquext.devcorators.attachBodyToResponse(hyperquext);
var _ = require('underscore');
var utility = require('./utility');
// var renderer = require('./DocumentRenderer');
// var phantom = require('phantom');

var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1588.0 Safari/537.36'
}

function parser(string, separator) {
  var linkArray = string.split(separator)
  linkArray.join(' / ')
  // console.log(linkArray)
  return linkArray
}

function digester(doc){
	fs.readFile(doc, 'utf8', function(err, data){
		if (err) {
			return console.log(err);
		}		
		parser(data, '\n')
	})
}

function displayer(array) {
	console.log('done')
	// console.log('\n\n404s: ', _.where(array, {status: 404}).length);
	// console.log('\n301s: ', _.where(array, {status: 301}).length);
	// console.log('\n200s: ', _.where(array, {status: 200}).length);
	// console.log('\n\n404s: ', _.where(array, {status: 404}));
	// console.log('\n301s: ', _.where(array, {status: 301}));
	// console.log('\n200s: ', _.where(array, {status: 200}));

	// console.log('\n\ncontrol objects:', _.where(array, {type: 'control'}).length);
	// console.log(arrayOne.length);
	// console.log('treatment objects:', _.where(array, {type: 'offer'}).length);
	// console.log(arrayTwo.length);
	// console.log(_.where(array, {status: 200, url: 'http://www.verizonwireless.com/smartphones/iphone-6/?test=bk_offer&bkCmpID=61563,61602'}));
	// console.log('\n>> There were ' + _.where(array, {status: 302, type: 'offer'}).length + ' links unavailable for test.\n>> Reason:\n', _.where(array, {status: 302, type: 'offer'}));
}

function gatherer(array){
	var pages = []
	_.each(array, function(url){
		// request(url, {headers: headers, maxRedirects: 10}, function(error, res, html){
		s(url, {headers: headers, /*body: true,*/ maxRedirects: 10}, function(error, res){
			var data = {
				url: url,
				// status: null,
				redirect: null,
				// params: cmp(),
				// type: type(),
			}
			if(error){
				console.error(url + ' ERROR ' + error);
				data.status = 'error, connection reset'
			} else{
				var resolve = utility.parseUri(url);
				// var cmp = function(){
				// 	var c = utility.getUrlParameter(url, 'bkCmpID').split(',')
				// 	return c[1];
				// }
				// var type = function(){
				// 	var t = utility.getUrlParameter(url, 'test').split('_')
				// 	return t[1]
				// }

				data = {
					url: url,
					// status: res.statusCode,
					redirect: res.request.href,
					// params: cmp(),
					// type: type(),
				}
				console.log(/*data.status + '\n',*/ data.url/*, '\n', data.type, '\n', data.params*/);
				if (data.redirect)
					console.log(data.redirect)
				// if (!data.body)
				// 	console.log('get bodied')
				pages.push(data);
				// renderer.render(url, resolve.query) //for whatever reason, the renderer isn't working. works fine in the other app.
				// validator(data)
				// fs.write(pages)
				if (pages.length === array.length){
					displayer(pages)
				}
			}
		});			
	});
}

function validator(obj){
	_.each(pages, function(obj){
		obj.body
	})
}

function sorter(array){
	var linkArray = _.uniq(array)
	var urlArray = []
	_.each(linkArray, function(url){
		var base = url.replace(/(http(s)?:\/\/)|(\/.*){1}/g, '')
		if (base === 'www.verizonwireless.com' || base === 'espanol.vzw.com'){
			urlArray.push(url)
			return urlArray
		}
	})
	console.log('+++++++++++++++++++++++++++++++++++++++++', urlArray.length)
	console.log(urlArray)
	gatherer(urlArray)
}

fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) {
		return console.log(err);
	}		
	var linkArray = data.split(',')
	linkArray.join(' / ')
	sorter(linkArray)
})

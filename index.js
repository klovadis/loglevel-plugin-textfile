
/*
usage:
loglevelPluginTextfile(log, { filename: '/path/to/file' });
 
opt:
filename	[str|array]	Target file; may include [DATE] or [TIME] which will be replaced on startupd
prefix 		[str]		Message prefix, will be prepended with ': '
passthrough [bool]		Pass messages through to original logger; Default: false
flavor		[int]		0 = just the message; 1 = level: message, 2 = TIME level: message, 3 = DATE TIME level: message

TODO: maxsize		[int]		0, -1: no limit; otherwise limit in kilobytes

 */
 var path = require('path')
 ,	fs = require('fs')
 ,	readline = require('readline');
 

// returns a String yyyy-mm-dd
function getDateString() {
	var n = new Date();
	var p = (s) => { return ('0' + s).slice(-2); };
	return		n.getFullYear() + '-' 
		+		p(n.getMonth()+1) + '-'
		+		p(n.getDay() +1);
} // getDateString
 
// returns a String hhmmss
function getTimeString() {
	var n = new Date();
	var p = (s) => { return ('0' + s).slice(-2); };
	return		p(n.getHours()) + ''
		+		p(n.getMinutes()) + ''
		+		p(n.getSeconds());
} // getTimeString
 
// returns a String hh:mm:ss
function getTimeString2() {
	var n = new Date();
	var p = (s) => { return ('0' + s).slice(-2); };
	return		p(n.getHours()) + ':'
		+		p(n.getMinutes()) + ':'
		+		p(n.getSeconds());
} // getTimeString
 
 
exports = module.exports = function(logger, opt) {
    if (!logger || !logger.methodFactory)
        throw new Error('loglevel instance has to be specified in order to be extended');
	
	// sanitize opt argument
	if (typeof opt === 'string') opt = { filename: opt };
	if (Array.isArray(opt.filename)) opt.filename = path.join.apply(null, opt.filename);
	if (typeof opt !== 'object') throw new Error('Second argument must be a filename or an options object.');
	
	// join path if it is an array
	if (Array.isArray(opt.filename)) opt.filename = path.join(opt.filename);
	
	// replace [DATE] and [TIME] in fileName argument
	opt.filename = opt.filename.replace('[DATE]', getDateString());
	opt.filename = opt.filename.replace('[TIME]', getTimeString());
	
	// Messageprefix must be a string
	var messagePrefix = '';
	if (typeof opt.prefix == 'string') messagePrefix = opt.prefix + ': ';
	
	// passthrough = also send to original logging function
	var passthrough = false;
	if (typeof opt.passthrough !== 'undefined') passthrough = (opt.passthrough == true) ? true : false;
	
	// synchroneous logging
	var sync = false;
	if (typeof opt.sync !== 'undefined') sync = (opt.sync == true) ? true : false;
	
	// append to logfile
	var append = true;
	if (typeof opt.append !== 'undefined') append = (opt.append == true) ? true : false;
	
	// flavor
	var flavor = 0;
	if (typeof opt.flavor !== 'undefined') flavor = parseInt(opt.flavor);
	if (typeof opt.flavour !== 'undefined') flavor = parseInt(opt.flavour);
	
	// attempt to open log file
	var ready = false
	,	fd = null
	,	fsize = 0
	,	fstream = null;
	
	// get file size, if exists
	fs.stat(opt.filename, (err, stats) => {
		//if (err) console.dir(err);
		if (!err) fsize = stats.size;
		fs.open(opt.filename, 'a+', 0666, (err, d) => {
			if (err) throw err;
			fd = d;
			fstream = fs.createWriteStream('', {
				start: fsize,
				autoClose: false,
				fd: fd
			});
			ready = true;
			writeLine();
		});
	});

	
	// close file if process exits
	process.on('exit', (code) => {	if (ready) try { fs.close(fd); } catch(err) {}	});
	
	// factory function
	var writeQueue = [], position = 0;
	var origFactory = logger.methodFactory;
    logger.methodFactory = function (methodName, logLevel) {
        var passthroughFn = origFactory(methodName, logLevel)
		,	level = methodName.toUpperCase();
        return function (message) {
			// four flavors
			if (typeof message === 'object' && message instanceof Error) message = message.stack;
			if (flavor > 0) message = level + ':\t' + message;
			if (flavor > 1) message = getTimeString2() + "\t" + message;
			if (flavor > 2) message = getDateString() + " " + message;
			
			// append message to queue
			writeQueue.push(message);
			if (writeQueue.length == 1 && ready == true) writeLine();
			
			// call original function as well?
			if (passthrough) passthroughFn(messagePrefix + message);
        }
    } // methodFactory
	
	
	// write lines to the output file
	function writeLine() {
		if (!ready || !writeQueue.length) return;
		var str = writeQueue.shift() + '\n';
		fsize = fsize + str.length;
		fstream.write(str);
		if (writeQueue.length > 0) writeLine();
	}; // writeLine
	
	
} // export
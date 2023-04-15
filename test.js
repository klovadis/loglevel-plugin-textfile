
// include libraries
var loglevel = require('loglevel')
,	loglevelPluginTextfile = require('./index.js');

// initialize three loggers
var log1 = loglevel.getLogger('consoleOnly')
,	log2 = loglevel.getLogger('consoleFileOnly')
,	log3 = loglevel.getLogger('consoleAndFile');

// apply plugin
loglevelPluginTextfile(log2, { filename: [__dirname, '/[DATE] log_two.txt'], prefix: 'Log 2', flavor:1 });
loglevelPluginTextfile(log3, { filename: [__dirname, '/log_three.txt'], passthrough: true, prefix: 'Log 3', flavor:3 });


function LogSomeMessages(log) {
	log.setLevel('trace');
	log.trace('This is a trace message.');
	log.debug('This is a debug message.');
	log.info('This is an info message.');
	log.warn('This is a warn message.');
	log.warn(new Error('This is an error object as warn message.'));
	log.error('This is an error message');
	log.error(new Error('This is an error object'));
}

LogSomeMessages(log1);
LogSomeMessages(log2);
LogSomeMessages(log3);
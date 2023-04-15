# loglevel-plugin-textfile

A plugin for the node logging package [pimterry/loglevel](https://github.com/pimterry/loglevel) that outputs messages to a log file.

## Installation
Install via npm, optionally --save.
```
npm install loglevel-plugin-textfile
```

## Usage


```javascript
var loglevel = require('loglevel')
,	loglevelPluginTextfile = require('loglevel-plugin-textfile');

loglevelPluginTextfile(loglevel, options);

loglevel_instance.warn('This is a warning.');
```

Or:

```javascript
var loglevel = require('loglevel')
,	loglevel_instance = loglevel.getLogger('some_instance')
,	loglevelPluginTextfile = require('loglevel-plugin-textfile');

loglevelPluginTextfile(loglevel_instance, options);

loglevel_instance.warn('This is a warning.');
```

## Options
The options object may have the following fields:
```javascript
{
	filename: '/path/to/file/[DATE]_[TIME]_mylog.log',
	passthrough: true, 
	prefix: 'MyPrefix',
	flavor: 0
}
```

## Changelog

### Version 0.1.0
Initial commit.
// hookshot-client.js
// https://github.com/Cygnut/Hookshot.Client/blob/master/Hookshot.Client/Api/Requests/Requests.cs

var HookshotClient =
{
	// Calls cb(null, data) on result, else cb(errorThrown) on error.
	function _get(cb, path, qps) {
		var urlString = path + (qps ? "?" + qps : "");
		
		$.ajax({
			url: urlString,
			dataType: "json"
		})
		.done(function(data, textStatus, jqXHR) {
			cb(null, data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			cb(errorThrown);
		});
	}
	
	function _post(cb, url, data) {
		$.ajax({
			url: url,
			processData: false,	// don't turn data into a query string put on the url.
			type: "POST",
			data: data
		})
		.done(function(data, textStatus, jqXHR) {
			cb(null, data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			cb(errorThrown);
		});
	}
	
	function _delete(cb, url) {
		$.ajax({
			url: url,
			type: "DELETE"
		})
		.done(function(data, textStatus, jqXHR) {
			cb(null, data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			cb(errorThrown);
		});
	}
	
	
	
	api: function(cb) {
		_get(cb, '/api');
	},
	
	ping: function(cb, msg) {
		_get(cb, '/ping', $.param({ 
			msg: msg 
		}));
	},
	
	screen: function(db) {
		_get(cb, '/screen/now');
	},
	
	screenInfo: function(cb) {
		_get(cb, '/screen/info');
	},
	
	osSchema: function(cb) {
		_get(cb, '/os/schema');
	},
	
	os: function(cb) {
		_get(cb, '/os/query');
	},
	
	serviceSchema: function(cb) {
		_get(cb, '/service/schema');
	},
	
	service: function(cb) {
		_get(cb, '/service/query');
	},
	
	sleep: function(cb) {
		_post(cb, '/os/sleep');
	},
	
	powerOff: function(cb) {
		_post(cb, '/os/power-off');
	},
	
	datasetsSchema: function(cb) {
		_get(cb, '/datasets/schema');
	},
	
	dataset: function(cb, name, from, to) {
		_get(cb, '/datasets/dataset/' + name, $.param({ 
			from: from, 
			to: to 
		}));
	},
	
	processes: function(cb) {
		_get(cb, '/processes');
	},
	
	killProcess: function(cb, pid) {
		_delete(cb, '/processes/' + pid);
	},
	
	drives: function(cb) {
		_get(cb, '/filesystem/drives');
	},
	
	files: function(cb, path) {
		_get(cb, '/filesystem/files', $.param({ 
			path: path 
		}));
	},
	
	runFile: function(cb, path, args) {
		_post(cb, '/filesystem/files/run', $.param({ 
			path: path, 
			args: args 
		}));
	},
	
	beep: function(cb, frequency, duration) {
		_post(cb, '/os/beep', $.param({ 
			frequency: frequency, 
			duration: duration 
		}));
	},
	
	speak: function(cb, text, rate, volume) {
		_post(cb, '/os/speak', $.param({ 
			text: text, 
			rate: rate, 
			volume: volume 
		}));
	},
	
	cdDrive: function(cb, open) {
		_post(cb, '/os/cdrom', $.param({ 
			action: 
			open ? 'open' : 'close' 
		}));
	},
	
	monitor: function(cb, on) {
		_post(cb, '/os/monitor', $.param({ 
			action: os ? 'on', 'off' 
		}));
	},
	
	changeSystemVolume: function(cb, volumeChange, component, device) {
		_post(cb, '/os/changesysvolume', $.param({ 
			volumeChange: volumeChange, 
			component: component, 
			device: device 
		}));
	},
	
	muteSystemVolume: function(mute, component, device) {
		_post(cb, '/os/mutesysvolume', $.param({ 
			action: mute ? '1' : '0', 
			component: component, 
			deviceIndex: device 
		}));
	},
	
	changeAppVolume: function(process, volumeLevel, device) {
		_post(cb, '/os/changeappvolume', $.param({ 
			process: process, 
			volumeLevel: volumeLevel, 
			deviceIndex: device 
		}));
	},
	
	muteAppVolume: function(process, mute, device) {
		_post(cb, '/os/muteappvolume', $.param({ 
			process: process, 
			action: mute ? '1' : '0', 
			deviceIndex: device 
		}));
	},
	
	setSystemVolume: function(volumeLevel, component, device) {
		_post(cb, '/os/setsysvolume', $.param({ 
			volumeLevel: volumeLevel, 
			component: component, 
			deviceIndex: device 
		}));
	},
	
	setAppVolume: function(process, volumeLevel, device) {
		_post(cb, 'os/setappvolume', $.param({ 
			process: process, 
			volumeLevel: volumeLevel, 
			deviceIndex: device 
		}));
	}
};
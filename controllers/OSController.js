const
	os = require('os'),
	util = require('util'),
	log = require('winston'),
	tools = require('./Tools'),
	powerOff = require('./PowerOff'),
	sleepMode = require('./SleepMode'),
	arrify = require('arrify'), 
	DynamicMap = require('./DynamicMap'),
	nir = require('node-nircmd')();

function OSController(refreshPeriod)
{
	this.map = new DynamicMap(refreshPeriod);
	
	this.map.add('EOL', 		os.EOL);
	this.map.add('arch', 		os.arch());
	this.map.add('release', 	os.release());
	this.map.add('cpus', 		os.cpus());
	this.map.add('freemem', 	() => { return os.freemem(); });
	this.map.add('usedmem', 	() => { return os.totalmem() - os.freemem(); });
	this.map.add('totalmem', 	() => { return os.totalmem(); });
	this.map.add('uptime', 		() => { return tools.toHHMMSS(os.uptime()); });
	
	this.monitorAsync = false;
}

(function() {
	
	this.register = function(app)
	{
		app.get('/os/schema', this.schema.bind(this));
		app.get('/os/query', this.query.bind(this));
		app.post('/os/power-off', this.powerOff.bind(this));
		app.post('/os/sleep', this.sleep.bind(this));
		app.post('/os/beep', this.beep.bind(this));
		app.post('/os/speak', this.speak.bind(this));
		app.post('/os/cdrom', this.cdrom.bind(this));
		app.post('/os/monitor', this.monitor.bind(this));
		app.post('/os/changesysvolume', this.changesysvolume.bind(this));
		app.post('/os/mutesysvolume', this.mutesysvolume.bind(this));
		app.post('/os/changeappvolume', this.changeappvolume.bind(this));
		app.post('/os/muteappvolume', this.muteappvolume.bind(this));
		app.post('/os/setappvolume', this.setappvolume.bind(this));
		app.post('/os/setsysvolume', this.setsysvolume.bind(this));
	}
	
	this.getFields = function()
	{
		return this.map.getNames();
	}
	
	this.getFieldValue = function(field)
	{
		return this.map.getValue(field).value;
	}
	
	this.getFieldValues = function(fields)
	{
		if (!fields || fields.length == 0) fields = this.getFields();
		return this.map.getValues(fields);
	}
	
	this.schema = function(req, res)
	{
		res.json({
			fields: this.getFields()
		});
	}
	
	this.query = function(req, res)
	{
		res.json({
			result: this.getFieldValues(
				arrify(req.query.field)
				)
		});
	}
	
	this.sleep = function(req, res)
	{
		sleepMode(function(err) {
			if (err) 
			{
				log.error(err);
				res.status(500).json({ error: 'Can\'t run sleep' })
			}
			else
				res.end()
		});
	}
	
	this.powerOff = function(req, res)
	{
		powerOff(function(err) {
			if (err)
			{
				log.error(err)
				res.status(500).json({ error: 'Can\'t run power-off' })
			}
			else
				res.end();
		});
	}
	
	function handleNirCmd(res, err, result)
	{
		if (err)
		{
			log.error(err)
			res.status(500);
		}
		
		return res.json({
			error: err,
		});
	}
	
	this.beep = function(req, res)
	{
		nir.beep({
			frequency: req.query.frequency,
			duration: req.query.duration
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.speak = function(req, res)
	{
		nir.speak({
			text: req.query.text,
			rate: req.query.rate,
			volume: req.query.volume
		}, 
		handleNirCmd.bind(this, res));
	}
	
	/*
		req.query.action should be one of [ 'open', 'close' ].
	*/
	this.cdrom = function(req, res)
	{
		nir.cdrom({
			action: req.query.action
		}, 
		handleNirCmd.bind(this, res));
	}
	
	/*
		req.query.action should be one of [ 'on', 'off', 'low' ].
		Async should be decided serverside.
	*/
	this.monitor = function(req, res)
	{
		nir.monitor({
			action: (this.monitorAsync ? 'async_' : '') + req.query.action
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.changesysvolume = function(req, res)
	{
		nir.changesysvolume({
			volumeChange: req.query.volumeChange,		// required: Integer
			component: req.query.component,				// optional: String
			deviceIndex: req.query.deviceIndex			// optional: String
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.mutesysvolume = function(req, res)
	{
		nir.mutesysvolume({
			action: req.query.action,				// required: Integer - 1 mute, 0 unmute
			component: req.query.component,			// optional: String
			deviceIndex: req.query.deviceIndex		// optional: String
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.changeappvolume = function(req, res)
	{
		nir.changeappvolume({
			process: req.query.process,				// required: String image name or /pid
			volumeLevel: req.query.volumeLevel,		// required: Float percentage change in [-1, 1]
			deviceIndex: req.query.deviceIndex		// optional: String
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.muteappvolume = function(req, res)
	{
		nir.muteappvolume({
			process: req.query.process,				// required: String image name or /pid
			action: req.query.action,				// required: Integer - 1 mute, 0 unmute
			deviceIndex: req.query.deviceIndex		// optional: String
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.setappvolume = function(req, res)
	{
		nir.setappvolume({
			process: req.query.process,				// required: String image name or /pid
			volumeLevel: req.query.volumeLevel,		// required: Float percentage change in [0, 1]
			deviceIndex: req.query.deviceIndex		// optional: String
		}, 
		handleNirCmd.bind(this, res));
	}
	
	this.setsysvolume = function(req, res)
	{
		nir.setsysvolume({
			volumeLevel: req.query.volumeLevel,			// required: Integer value between 0 (silence) and 65535 (full volume)
			component: req.query.component,		// optional: String
			deviceIndex: req.query.deviceIndex		// optional: String
		}, 
		handleNirCmd.bind(this, res));
	}
	
}).call(OSController.prototype);

module.exports = OSController;
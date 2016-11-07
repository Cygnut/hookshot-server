const
	process = require('process'),
	util = require('util'),
	log = require('winston'),
	tools = require('./Tools'),
	arrify = require('arrify'),
	DynamicMap = require('./DynamicMap');

function ServiceController(refreshPeriod, version)
{
	this.map = new DynamicMap(refreshPeriod);
	
	this.map.add("memory", () => {
		var m = process.memoryUsage();
		
		return {
			residentSetSize: m.rss,
			heapTotal: m.heapTotal,
			heapUsed: m.heapUsed,
		};
	});
	this.map.add("uptime", () => {
		return tools.toHHMMSS(process.uptime())
	});
	this.map.add("version", version);
	this.map.add("versions", process.versions);
	if (process.cpuUsage)
		this.map.add("cpuUsage", () => {
			return process.cpuUsage();
		});
}

(function() {
	
	this.register = function(app)
	{
		app.get('/service/schema', this.schema.bind(this));
		app.get('/service/query', this.query.bind(this));
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
	
}).call(ServiceController.prototype);

module.exports = ServiceController;
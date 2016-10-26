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

ServiceController.prototype.register = function(app)
{
	app.get('/service/schema', this.schema.bind(this));
	app.get('/service/query', this.query.bind(this));
}

ServiceController.prototype.getFields = function()
{
	return this.map.getNames();
}

ServiceController.prototype.getFieldValue = function(field)
{
	return this.map.getValue(field).value;
}

ServiceController.prototype.getFieldValues = function(fields)
{
	if (!fields || fields.length == 0) fields = this.getFields();
	return this.map.getValues(fields);
}

ServiceController.prototype.schema = function(req, res) 
{
	res.json({
		fields: this.getFields()
	});
}

ServiceController.prototype.query = function(req, res) 
{
	res.json({
		result: this.getFieldValues(
			arrify(req.query.field)
			)
	});
}

module.exports = ServiceController;
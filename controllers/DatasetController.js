const
	Datasets = require('./Datasets'),
	log = require('winston');

function DatasetController(defaultPeriod, defaultLimit, os, service)
{
	this.datasets = new Datasets(defaultPeriod, defaultLimit);
	
	// Register datasets:
	this.datasets.add({ 
		name: "os.freemem", 
		sampler: () => os.getFieldValue('freemem') });
	this.datasets.add({ 
		name: "os.usedmem", 
		sampler: () => os.getFieldValue('usedmem') });
	this.datasets.add({ 
		name: "service.residentSetSize", 
		sampler: () => service.getFieldValue('memory').residentSetSize });
	this.datasets.add({ 
		name: "service.heapTotal", 
		sampler: () => service.getFieldValue('memory').heapTotal });
	this.datasets.add({ 
		name: "service.heapUsed", 
		sampler: () => service.getFieldValue('memory').heapUsed });
}

DatasetController.prototype.register = function(app)
{
	app.get('/datasets/schema', this.schema.bind(this));
	app.get('/datasets/dataset/:datasetName', this.dataset.bind(this));
}

DatasetController.prototype.schema = function(req, res)
{
	res.json({
		datasets: this.datasets.getDatasetConfigs(),
	});
}

DatasetController.prototype.dataset = function(req, res)
{
	res.json({
		dataset: this.datasets.getDatasetValues(req.params.datasetName, req.query.from, req.query.to)
	});
}

module.exports = DatasetController;
const
	fs = require('fs'),
	util = require('util'),
	log = require('winston'),
	path = require('path'),
	screenshot = require('desktop-screenshot');

function ScreenController(imagePath, period)
{
	this.imagePath = imagePath;
	this.period = period || 10 * 1000;
	this.whenCaptured = null;
	
	// Ensure the image directory exists.
	var dir = path.dirname(this.imagePath);
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir);
	
	this.updateWhenCaptured = function()
	{
		// Update when the image was captured according to the last modified time.
		fs.stat(this.imagePath, function(err, stats) {
			if (!err)
				this.whenCaptured = new Date(util.inspect(stats.mtime));
		}.bind(this));
	}
	
	this.updateWhenCaptured();
	
	this.updateScreenshot = function()
	{
		screenshot(this.imagePath, function(error, complete) {
			if (error)
				log.error("Screenshot failed with error: %s", error);
			
			this.updateWhenCaptured();
			
		}.bind(this));
	};
	
	setInterval(this.updateScreenshot.bind(this), this.period);
}

(function() {
	
	this.register = function(app)
	{
		app.get('/screen/now', this.now.bind(this));
		app.get('/screen/info', this.info.bind(this));
	}
	
	this.getInfo = function()
	{
		return {
			imagePath: this.imagePath,
			whenCaptured: this.whenCaptured,
			period: this.period
		}
	}
	
	this.now = function(req, res)
	{
		res.sendFile(this.getInfo().imagePath, null, (err) => {
			if (err)
			{
				log.error('Failed to send screenshot with error %s', err);
				res.status(err.status);
			}
			return res.end();
		});
	}
	
	this.info = function(req, res)
	{
		var i = this.getInfo();
		
		res.json({
			whenCaptured: i.whenCaptured,
			period: i.period
		});
	}
	
}).call(ScreenController.prototype);

module.exports = ScreenController;
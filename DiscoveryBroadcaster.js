const
	dgram = require('dgram'),
	log = require('winston');

function DiscoveryBroadcaster(discoveryPort, discoveryPeriod)
{
	this.discoveryPort = discoveryPort || 2999;
	this.discoveryPeriod = discoveryPeriod || 2 * 1000;
	this.message = "";
	
	this.client = dgram.createSocket("udp4");
	this.client.bind();
	
	// Setting to broadcast must be done after the bind has completed.
	// However, .bind() is async, so we must schedule it to happen at some point after this.
	this.client.on('listening', function() {
		this.client.setBroadcast(true);
	}.bind(this));
}

DiscoveryBroadcaster.prototype.setMessage = function(message)
{
	this.message = message;
}

DiscoveryBroadcaster.prototype.start = function()
{
	if (!this.id)
	{
		log.info("Broadcasting discovery packets on port " + this.discoveryPort);
		
		var buf = new Buffer(this.message);
		
		this.id = setInterval(function() {
			this.client.send(
				buf, 
				0, 
				buf.length, 
				this.discoveryPort, 
				"255.255.255.255");
		}.bind(this), this.discoveryPeriod);
	}
}

DiscoveryBroadcaster.prototype.stop = function()
{
	if (this.id)
		clearInterval(this.id)
}

module.exports = DiscoveryBroadcaster;
const 
	pkg = require('./package.json'),
	program = require('commander'),
	express = require('express'),
	log = require('winston'),
	path = require('path'),
	address = require('network-address');

// Initialise logging.
require('./Logging').init();

// Fetch program parameters:
program
	.version(pkg.version)
	.option('-p, --port <n>', 'Web server port, defaults to 3000.', parseInt)
	.parse(process.argv);

const webServerPort = program.port || 3000;

const Discovery = new (require('./DiscoveryBroadcaster'))();

var app = express();

// Templating:
app.set('views', './views');
app.set('view engine', 'pug');

// Create controllers:
var controllers = {};
controllers.ping = new (require('./controllers/PingController'))();
controllers.screen = new (require('./controllers/ScreenController'))(path.join(__dirname, 'temp', 'desktop.png')),
controllers.os = new (require('./controllers/OSController'))(3000),
controllers.service = new (require('./controllers/ServiceController'))(3000, pkg.version),
controllers.processes = new (require('./controllers/ProcessController'))(3000);
controllers.dataset = new (require('./controllers/DatasetController'))(3000, 500, controllers.os, controllers.service);
controllers.fs = new (require('./controllers/FilesystemController'))();
controllers.api = new (require('./controllers/ApiController'))(app);

// Register controllers:
Object.keys(controllers).forEach(function(key) {
	controllers[key].register(app);
});

// Listen:
var server = app.listen(webServerPort, () => {
	
	var host = server.address().address;
	var port = server.address().port;
	
	var msg = "App listening at http://" + host + ":" + port;
	log.info(msg);
	
	Discovery.setMessage(JSON.stringify(
	{
		app: 'Hookshot',
		hostname: require('os').hostname(),
		host: address(),
		port: webServerPort
	}));
	Discovery.start();
});
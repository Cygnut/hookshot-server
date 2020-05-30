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
// Static files:
app.use(express.static('public'));

// Create controllers:
var controllers = {
    ping: new (require('./controllers/PingController'))(),
    screen: new (require('./controllers/ScreenController'))(path.join(__dirname, 'temp', 'desktop.png')),
    os: new (require('./controllers/OSController'))(3000),
    service: new (require('./controllers/ServiceController'))(3000, pkg.version),
    processes: new (require('./controllers/ProcessController'))(3000),
    fs: new (require('./controllers/FilesystemController'))(),
    api: new (require('./controllers/ApiController'))(app)
};
// We gotta do this one last due to controller dependency!
controllers.dataset = new (require('./controllers/DatasetController'))(3000, 500, controllers.os, controllers.service);

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
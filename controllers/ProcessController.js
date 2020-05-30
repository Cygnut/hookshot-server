const
    proc = require('./Processes')(),
    log = require('winston');
 
function ProcessController(period)
{
    this.processes = [];
    this.lastUpdated = Date.now();
    
    setInterval(function() 
    {
        proc.list(function(err, results) {
            if (err)
            {
                log.error('Failed to capture process information with error %s', err);
                return;
            }
            
            this.lastUpdated = Date.now();
            this.processes = results.map(proc => proc);
        }.bind(this));
    }.bind(this), period);
}

(function() {
    
    this.register = function(app)
    {
        app.get('/processes', this.get.bind(this));
        app.delete('/processes/:pid', this.kill.bind(this));
    }
    
    this.getProcesses = function()
    {
        return {
            lastUpdated: this.lastUpdated,
            processes: this.processes
        };
    }
    
    this.killProcess = function(pid, callback)
    {
        proc.kill(pid, callback);
    }
    
    this.get = function(req, res)
    {
        res.json(
            this.getProcesses()
        );
    }
    
    this.kill = function(req, res)
    {
        this.killProcess(req.params.pid, function(err, result) {
            if (err) res.status(500);
            res.json({
                result: err ? false : true,
                error: err
            });
        });
    }
    
}).call(ProcessController.prototype);

module.exports = ProcessController;
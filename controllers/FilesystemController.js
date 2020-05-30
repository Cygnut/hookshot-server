const 
    process = require('process'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    async = require('async'),
    log = require('winston'),
    Spawner = require('./Spawner'),
    cp = require('child_process');

/*
    fields = String[]
        Can contain
            DeviceID,
            VolumnName,
            Name
    next = function(err, result)
    result is an array of objects, each representing a drive.
*/
function drives(fields, next)
{
    // wmic and semantics only make sense on Windows.
    if (process.platform !== 'win32') 
        throw new Error('Supports Windows only.');
    
    function chunk(arr, len)
    {
        var chunks = [], i = 0;
        while (i < arr.length)
            chunks.push(arr.slice(i, i += len));
        return chunks;
    }
    
    var args = [ 'logicaldisk', 'get', fields.toString(), '/format:list' ];
    var command = `wmic`;
    new Spawner()
        .command(command)
        .args(args)
        .error(function(err) { next(err, null); })
        .close(function(code, stdout, stderr) 
        {
            if (!stdout || code !== 0)
                return next(`"${command} ${args}" error occurred, code: ${code} stderr: ${stderr}`, null);
            
            var lines = stdout
                .split(os.EOL)
                .map(function(l) { return l.replace(/\r?\n|\r/g, ''); })
                .filter(function(value) { return value; });
            
            var result = 
                chunk(lines, fields.length)
                .map(function(c) {
                    var obj = {};
                    c.forEach(function(i) {
                        var sp = i.split('=');
                        obj[sp[0]] = (sp.length === 1 ? null : sp[1]);
                    });
                    return obj;
                });
            
            return next(null, result);
        })
        .run();
}

function FilesystemController()
{
    this.cachedDrives = null;
}

(function() {
    
    this.register = function(app)
    {
        app.get('/filesystem/drives', this.drives.bind(this));
        app.get('/filesystem/files', this.files.bind(this));
        app.post('/filesystem/files/run', this.run.bind(this));
    }
    
    /*
        next = function(err, drives)
    */
    function getDrivesResult(next)
    {
        drives(
            [ 'DeviceID', 'VolumeName', 'Name' ], 
            function(err, result) 
            {
                if (err)
                    return next(err, null);
                
                return next(null, 
                    {
                        drives: result.map(
                            function(r) 
                            {
                                return { 
                                    name: r.Name, 
                                    volumeName: r.VolumeName, 
                                };
                            })
                    });
            });
    }
    
    this.drives = function(req, res)
    {
        if (!this.cachedDrives)
        {
            getDrivesResult(function(err, drives) {
                if (err)
                {
                    res.status(500).json({});
                    return log.warn(err);
                }
                
                this.cachedDrives = drives;
                
                var names = this.cachedDrives.drives.map(function(d) { return d.name; });
                log.info(`FilesystemController found drives ${names}.`);
                
                return res.json(this.cachedDrives);
            }.bind(this));
        }
        else return res.json(this.cachedDrives);
    }
    
    function createFilesResult(dir, files)
    {
        return { 
            path: path.normalize(dir),
            files: files || []
            };
    }
    
    this.files = function(req, res)
    {
        var dir = req.query.path || '';
        fs.readdir(dir, function(err, files)
        {
            if (err)
            {
                log.warn(`Failed to get directory information for ${dir} with error ${err}`);
                return res.status(500).json(createFilesResult(dir, null));
            }
            
            async.map(
                files, 
                // Get stats on each directory entry in parallel.
                function(file, callback) {
                    fs.stat(path.join(dir, file), function(er, stats) {
                        callback(null, { 
                            file: file,
                            stats: er ? null : stats    // Trap errors (instead passing null stats)
                        });
                    });
                },
                // Callback called when all items processed.
                function (er, results) {
                    
                    if (er)
                    {
                        log.warn(`Failed to get directory stats for ${dir} with error ${er}`);
                        return res.status(500).json(createFilesResult(dir, null));
                    }
                    
                    var data = results.map(function(r) {
                        var item = {
                            name: r.file,
                            path: path.join(dir, r.file),
                            ext: null,
                            type: null
                        }
                        
                        if (r.stats)
                        {
                            var isDir = r.stats.isDirectory();
                            item.ext = isDir ? null : path.extname(r.file);
                            item.type = isDir ? 'dir' : 'file';
                        }
                        
                        return item;
                    });
                    
                    return res.json(createFilesResult(dir, data));
                });
        });
    }
    
    this.run = function(req, res)
    {
        var args = req.query.args || [];
        
        var p = req.query.path;    
        var cwd = path.dirname(p);
        var file = path.basename(p);
        
        log.info(`Starting user-generated command ${p} with args ${args.toString()}.`);
        
        var child = cp.exec(
            file, 
            { 
                detached: true,
                cwd: cwd 
            }, 
            function(error, stdout, stderr) 
            {
                if (error || stderr) 
                    return log.warn(`User-generated command ${p} with args ${args.toString()} failed with error: ${error}, stderr: ${stderr}`);
                
                log.info(`User-generated command ${p} with args ${args.toString()} terminated.`);
            });
        // By default, this app will wait for this child process to end, and maintain a link to it (which 
        // may get unruly when it comes to memory etc). To avoid this, explicitly unref() the child so
        // it can live free, detached from its parent.
        // https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
        child.unref();
        
        return res.json({ });
    }
    
}).call(FilesystemController.prototype);

module.exports = FilesystemController;
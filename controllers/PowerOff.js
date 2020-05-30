'use strict';

var isLinux = require('is-linux'),
    isOsx = require('is-osx'),
    isWindows = require('is-windows'),
    Spawner = require('./Spawner');

module.exports = function (next) {
    var cmd = '';
    var args = [];
    
    if(isLinux() || isOsx()) {
        cmd = 'sudo shutdown -h now';
    } else if(isWindows()) {
        cmd = 'shutdown';
        args = [ '-s' ];
    } else {
        throw new Error('Unknown OS!');
    }
    
    return new Spawner()
        .command(cmd)
        .args(args)
        .error(function(err) { return next(err); })
        .close(function(code, stdout, stderr) {
            if (code !== 0) 
                return next(`${cmd} ${args} error occurred, code: ${code} stderr: ${stderr}`);
        
            return next(null);
        })
        .run();
};

const
	os = require('os'),
	neatCsv = require('neat-csv'),
	sec = require('sec'),
	process = require('process'),
	Spawner = require('./Spawner');

function Processes()
{
	if (process.platform !== 'win32') 
		throw new Error('Supports Windows only.');
}

/*
 * next = function(err, result)
*/
Processes.prototype.list = function(next)
{
	// Impl is a mix of:
	//		https://github.com/sindresorhus/tasklist/blob/master/index.js
	//		https://github.com/soyuka/pidusage/blob/master/lib/stats.js
	// We have to use spawn to avoid creating a million console windows while running, not exec or anything else.
	// See https://github.com/Unitech/pm2/issues/584#issuecomment-68558128 , https://github.com/soyuka/pidusage/pull/12
	
	return new Spawner()
		.command('tasklist')
		.args(['/v', '/nh', '/fo', 'CSV'])
		.error(function(err) { return next(err, null); })
		.close(function(code, stdout, stderr) 
		{
			if (!stdout || code !== 0) 
				return next(`tasklist error occurred, code: ${code} stderr: ${stderr}`, null);
			
			neatCsv(stdout, 
			{ 
				headers: [
					'imageName',
					'pid',
					'sessionName',
					'sessionNumber',
					'memUsage',
					'status',
					'username',
					'cpuTime',
					'windowTitle'
			]})
			.then(function (data) {
				
				var result = data.map(function (el) 
				{
					Object.keys(el).forEach(function (key) {
						if (el[key] === 'N/A') {
							el[key] = null;
						}
					});
					
					el.pid = Number(el.pid);
					el.sessionNumber = Number(el.sessionNumber);
					el.memUsage = Number(el.memUsage.replace(/[^\d]/g, '')) * 1024;	// memory usage in bytes.
					el.cpuTime = sec(el.cpuTime) * 1000;	// cpu time in milliseconds.
					return el;
				});
				
				return next(null, result);
			});
		})
		.run();
}

/*
 * next = function(err, result)
*/
Processes.prototype.kill = function(pid, next)
{
	var args = [];
	args.push('/PID');
	args.push(pid);
	args.push('/F');	// Force
	
	return new Spawner()
		.command('taskkill')
		.args(args)
		.error(function(err) { return next(err, null); })
		.close(function(code, stdout, stderr)
		{
			if (!stdout || code !== 0) 
				return next(`taskkill error occurred, code: ${code} stderr: ${stderr}`, null);
		
			return next(null, stdout);
		})
		.run();
}

module.exports = function() {
	return new Processes();
}
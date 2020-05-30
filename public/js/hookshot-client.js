// hookshot-client.js
// https://github.com/Cygnut/Hookshot.Client/blob/master/Hookshot.Client/Api/Requests/Requests.cs

var HookshotClient =
{
    // Calls cb(null, data) on result, else cb(errorThrown) on error.
    _get: function(cb, path, qps) {
        var urlString = path + (qps ? "?" + qps : "");
        
        $.ajax({
            url: urlString,
            dataType: "json"
        })
        .done(function(data, textStatus, jqXHR) {
            cb(null, data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            cb(errorThrown);
        });
    },
    
    _post: function(cb, url, data) {
        var urlString = url + (data ? "?" + data : "");
        
        $.ajax({
            url: urlString,
            processData: false,    // don't turn data into a query string put on the url.
            type: "POST",
        })
        .done(function(data, textStatus, jqXHR) {
            cb(null, data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            cb(errorThrown);
        });
    },
    
    _delete: function(cb, url) {
        $.ajax({
            url: url,
            type: "DELETE"
        })
        .done(function(data, textStatus, jqXHR) {
            cb(null, data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            cb(errorThrown);
        });
    },
    
    
    
    api: function(cb) {
        this._get(cb, '/api');
    },
    
    ping: function(cb, msg) {
        this._get(cb, '/ping', $.param({ 
            msg: msg 
        }));
    },
    
    screen: function(cb) {
        this._get(cb, '/screen/now');
    },
    
    screenInfo: function(cb) {
        this._get(cb, '/screen/info');
    },
    
    osSchema: function(cb) {
        this._get(cb, '/os/schema');
    },
    
    os: function(cb) {
        this._get(cb, '/os/query');
    },
    
    serviceSchema: function(cb) {
        this._get(cb, '/service/schema');
    },
    
    service: function(cb) {
        this._get(cb, '/service/query');
    },
    
    sleep: function(cb) {
        this._post(cb, '/os/sleep');
    },
    
    powerOff: function(cb) {
        this._post(cb, '/os/power-off');
    },
    
    datasetsSchema: function(cb) {
        this._get(cb, '/datasets/schema');
    },
    
    dataset: function(cb, name, from, to) {
        this._get(cb, '/datasets/dataset/' + name, $.param({ 
            from: from, 
            to: to 
        }));
    },
    
    processes: function(cb) {
        this._get(cb, '/processes');
    },
    
    killProcess: function(cb, pid) {
        this._delete(cb, '/processes/' + pid);
    },
    
    drives: function(cb) {
        this._get(cb, '/filesystem/drives');
    },
    
    files: function(cb, path) {
        this._get(cb, '/filesystem/files', $.param({ 
            path: path 
        }));
    },
    
    runFile: function(cb, path, args) {
        this._post(cb, '/filesystem/files/run', $.param({ 
            path: path, 
            args: args 
        }));
    },
    
    beep: function(cb, frequency, duration) {
        this._post(cb, '/os/beep', $.param({ 
            frequency: frequency, 
            duration: duration 
        }));
    },
    
    speak: function(cb, text, rate, volume) {
        this._post(cb, '/os/speak', $.param({ 
            text: text, 
            rate: rate, 
            volume: volume 
        }));
    },
    
    cdDrive: function(cb, open) {
        this._post(cb, '/os/cdrom', $.param({ 
            action: 
            open ? 'open' : 'close' 
        }));
    },
    
    monitor: function(cb, on) {
        this._post(cb, '/os/monitor', $.param({ 
            action: on ? 'on' : 'off' 
        }));
    },
    
    changeSystemVolume: function(cb, volumeChange, component, device) {
        this._post(cb, '/os/changesysvolume', $.param({ 
            volumeChange: volumeChange, 
            component: component, 
            device: device 
        }));
    },
    
    muteSystemVolume: function(cb, mute, component, device) {
        this._post(cb, '/os/mutesysvolume', $.param({ 
            action: mute ? '1' : '0', 
            component: component, 
            deviceIndex: device 
        }));
    },
    
    changeAppVolume: function(cb, process, volumeLevel, device) {
        this._post(cb, '/os/changeappvolume', $.param({ 
            process: process, 
            volumeLevel: volumeLevel, 
            deviceIndex: device 
        }));
    },
    
    muteAppVolume: function(cb, process, mute, device) {
        this._post(cb, '/os/muteappvolume', $.param({ 
            process: process, 
            action: mute ? '1' : '0', 
            deviceIndex: device 
        }));
    },
    
    setSystemVolume: function(cb, volumeLevel, component, device) {
        this._post(cb, '/os/setsysvolume', $.param({ 
            volumeLevel: volumeLevel, 
            component: component, 
            deviceIndex: device 
        }));
    },
    
    setAppVolume: function(cb, process, volumeLevel, device) {
        this._post(cb, 'os/setappvolume', $.param({ 
            process: process, 
            volumeLevel: volumeLevel, 
            deviceIndex: device 
        }));
    }
};
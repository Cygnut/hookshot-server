
/*
    Expects conf to be:
    {
        name,
        period,
        limit,
        sampler,
    }
*/
function Dataset(conf)
{
    this.conf = conf;
    this.conf.timestampOffset = new Date().getTimezoneOffset() * 60 * 1000;
    this.samples = [];
    
    setInterval(function() {
        try
        {
            var sample = {
                value: this.conf.sampler(),
                // The number of milliseconds between midnight, January 1, 1970, and the current date and time.
                timestamp: Date.now()
            };
            
            this.samples.push(sample);
            
            // If this sample pushed us past the limit, remove the oldest item.
            if (this.samples.length > this.conf.limit)
                this.samples.splice(0, 1);
        }
        catch (e) {}
    }.bind(this), this.conf.period);
}

Dataset.prototype.getValues = function(from, to)
{
    // Need this operation to be somewhat quick, since it could be called a hella lot.
    var begin = from ? this.samples.findIndex(s => { return s.timestamp >= from; }) : 0;
    if (begin < 0) return [];
    
    var last = to ? this.samples.findIndex(s => { return s.timestamp <= to; }) : this.samples.length - 1;
    if (last < 0) return [];
    
    // Ensure these indices are in the correct order.
    begin = Math.min(begin, last);
    last = Math.max(begin, last);
    
    return this.samples.slice(begin, last + 1);
}




function Datasets(defaultPeriod, defaultLimit)
{
    this.defaultPeriod = defaultPeriod;
    this.defaultLimit = defaultLimit;
    
    this.datasets = [];
}

Datasets.prototype.add = function(conf)
{
    conf.period = conf.period || this.defaultPeriod;
    conf.limit = conf.limit || this.defaultLimit;
    
    this.datasets.push(new Dataset(conf));
}

Datasets.prototype.getDatasetConfigs = function()
{
    return this.datasets.map(d => d.conf);
}

// Returns an array.
Datasets.prototype.getDatasetValues = function(name, from, to)
{
    var dataset = this.datasets.find(d => d.conf.name.toLowerCase() === name.toLowerCase());
    if (!dataset) return null;
    return dataset.getValues(from, to);
}

module.exports = Datasets;

function MapItem(value)
{
    if (typeof value === "function")
        this.getter = value;
    else
        this.getter = () => { return value; };
    
    this.refresh();
}

MapItem.prototype.refresh = function()
{
    this.value = this.getter();
}


function DynamicMap(refreshPeriod)
{
    this.map = [];
    
    setInterval(this.refresh.bind(this), refreshPeriod);
}

DynamicMap.prototype.refresh = function()
{
    for (var key in this.map) {
        this.map[key].refresh();
    }
}

DynamicMap.prototype.add = function(name, value)
{
    this.map[name.toLowerCase()] = new MapItem(value);
}

DynamicMap.prototype.getValue = function(name)
{
    var normName = name.toLowerCase();
    
    if (normName in this.map)
        return {
            value: this.map[normName].value,
            exists: true
        };
    else
        return {
            value: null,
            exists: false
        };
}

DynamicMap.prototype.getValues = function(names)
{
    var result = {};
    
    names.forEach(function(name) {
        var v = this.getValue(name)
        if (v.exists)
            result[name] = v.value;
    }.bind(this));
    
    return result;
}

DynamicMap.prototype.getNames = function()
{
    return Object.keys(this.map);
}

module.exports = DynamicMap;
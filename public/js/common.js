
function createErrorPanelHtml(id, title, text)
{
    var h = "";
    h += "<div id=\"" + id + "\" class=\"w3-panel w3-red\">"
    h += "    <span onclick=\"this.parentElement.style.display='none'\" class=\"w3-closebtn\">&times;</span>"
    h += "    <h3>" + title + "</h3>"
    h += "    <p>" + text + "</p>"
    h += "</div>";
    return h;
}

function fadeRemoveErrorPanel(id)
{
    // Clear out any displayed errors now things are good.
    // It's good to do a fade so that the user can track what's going on.
    $("#" + id).fadeOut(300, function() { 
        $(this).remove(); 
    });
}

var UIConversion = {
    ByteUnits: [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ],
    
    FromBytes: function(bytes) {
        if (bytes == 0) return '0 B';
        var k = 1000; // or 1024 for binary
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(3) + ' ' + this.ByteUnits[i];
    }
}
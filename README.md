# hookshot-server
Node.js web app providing remote access to the machine it is hosted on. The API is fully consumed by the Hookshot.Client phone app, but there is current effort to provide a HTML client. 

The aim of this solution is to:
* Be easy to install.
* Be platform independent (currently hampered by some endpoints only having Windows specific implementations currently).
* Have a minimal set of dependencies.
* Implement endpoints asynchronously.

# API

GET	/api
GET /ping
msg
GET /screen/now
GET /screen/info
GET /os/schema
GET /os/query
GET /service/schema
GET /service/query
POST /os/sleep
POST /os/power-off
GET /datasets/schema
GET /datasets/dataset/{name}
from
to
GET /processes
DELETE /processes/{pid}
GET /filesystem/drives
GET /filesystem/files 
path
POST /filesystem/files/run
path
args
POST /os/beep
frequency
duration
POST /os/speak
text
rate
volume
POST /os/cdrom
action - 'open'/'close' 
POST '/os/monitor'
action - 'on'/'off'
POST '/os/changesysvolume'
volumeChange 
component 
device
POST /os/mutesysvolume
action - '1'/'0' 
component
deviceIndex
POST /os/changeappvolume
process
volumeLevel 
deviceIndex
POST /os/muteappvolume
process
action - '1'/'0'
deviceIndex
POST /os/setsysvolume 
volumeLevel
component
deviceIndex
POST os/setappvolume
process, 
volumeLevel, 
deviceIndex

# hookshot-server
NodeJs web app providing remote access to the device it is hosted on. The API is fully consumed by the Hookshot.Client phone app, but there is current effort to provide a HTML client. 

The aim of this solution is to:
* Be easy to install.
* Be platform independent (currently hampered by some endpoints only having Windows specific implementations currently).
* Have a minimal set of dependencies.
* Implement endpoints asynchronously.

# API

### GET /api
Get the most up to date documentation on the API in JSON format.

### GET /ping

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| msg | Query | A string to be sent back to track the ping request. |

Ping the server for availability with a piece of msg data.

### GET /screen/now

Get the latest screenshot of the full desktop.

### GET /screen/info

Get the JSON metadata on the latest screenshot.

### GET /os/schema

Get the full schema of /os field names available to use on the /os/query endpoint.

### GET /os/query

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| field | Query | List of fields to retrieve. Do not set to request all. |

Request a specific set of OS properties for the host. The available fields are provided by the /os/schema call for forwards compatability.

### GET /service/schema

Get the full schema of /service field names available to use on the /service/query endpoint.

### GET /service/query

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| field | Query | List of fields to retrieve. Do not set to request all. |

Request a specific set of Service properties. The available fields are provided by the /service/schema call for forwards compatibility.

### POST /os/sleep

Put the host to sleep, if this operation is supported.

### POST /os/power-off

Turn the host off, if this operation is supported.

### GET /datasets/schema

Get the set of available tracked datasets.

### GET /datasets/dataset/{name}

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| name | Path | The name of the dataset to retrieve. |
| from | Query | Starting time to get data points from, as a UNIX timestamp. Do not set to use the earliest recorded. |
| to | Query | Ending time to get data points from, as a UNIX timestamp. Do not set to use the latest recorded. |

Request the named set of data points over a specified interval - for example the memory available between 12PM and 1PM.

### GET /processes

Get the full set of running processes on the host.

### DELETE /processes/{pid}

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| pid | Query | The process id (pid) to kill. |

Kill the identified process on the host.

### GET /filesystem/drives

Get the filesystem drives on the host. E.g. C:\, F:\.

### GET /filesystem/files 

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| path | Query | The absolute path to the directory to retrieve filesystem information from. |

Get the files and folders from the absolute path provided.

### POST /filesystem/files/run

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| path | Query | The absolute path of the executable file to run. |
| args | Query | The program arguments to supply. |

Execute the specified program with given arguments.

### POST /os/beep

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| frequency | Query | The frequency of the sound in Hz. |
| duration | Query | The duration to play the sound over. |

Play a beep with specified properties on the host.

### POST /os/speak

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| text | Query | The text to speak. |
| rate | Query | The rate to speak at. |
| volume | Query | The volume to speak at. |

Say a specified phrase on the device.

### POST /os/cdrom

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| action | Query | Must be either 'open' or 'close'. |

Open or close the CD drive on the device.

### POST '/os/monitor'

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| action | Query | Must be either 'on' or 'off' |

Turn the monitor on or off.

### POST '/os/changesysvolume'

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| volumeChange | Query | The numeric volume delta to change by. |
| component | Query | The component to change, if required. |
| deviceIndex | Query | The specific device index, if required. |

Increment/Decrement the overall system volume level.

### POST /os/mutesysvolume

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| action | Query | Must be either mute = '1' or unmute = '0'. |
| component | Query | The component to change, if required. |
| deviceIndex | Query | The specific device index, if required. |

Mute the overall system volume level.

### POST /os/changeappvolume

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| process | Query | The process image name or pid. |
| volumeLevel | Query | The numeric volume delta to change by. |
| deviceIndex | Query | The specific device index, if required. |

Increment/Decrement a specific application's volume level.

### POST /os/muteappvolume

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| process | Query | The process image name or pid. |
| action | Query | Must be either mute = '1' or unmute '0'. |
| deviceIndex | Query | The specific device index, if required. |

Mute a specific application.

### POST /os/setsysvolume 

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| volumeLevel | Query | The absolute numeric volume. |
| component | Query | The component to change, if required. |
| deviceIndex | Query | The specific device index, if required. |

Set the overall system volume to a specific level.

### POST os/setappvolume

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| process | Query | The process image name or pid. | 
| volumeLevel | Query | The absolute numeric volume. | 
| deviceIndex | Query | The specific device index, if required. |

Set a specific application volume to a specific level.

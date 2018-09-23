# Socket chat

First experiment with [socket.io](https://socket.io/). Weird retro look was intentional.
# Server setup example

```javascript
let express = require("express")
let app = express()
server = http.createServer(app).listen(PORT)
require('./chat/index')(server);
app.use('/chat', express.static(__dirname+'/chat/public'));
```
# Screenshot
<img src="https://github.com/tuhnik/socket-chat/blob/master/screenshot/screenshot.png?raw=true">

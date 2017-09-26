(function () {

    //Define WebSocket and protocol variables
    let ws = null;

    //Define based object response to market_price_app.js 
    let onMessage_response = {
        'command': 'incomingMsg',
        'msg': null
    };

    //Receive message from market_price_app.js
    self.addEventListener('message', function (e) {
        let data = e.data;
        //Get command parameter to identify operation
        let command = data.command;

        if (command === 'connect') {
            connect(data.commandObj); //Establish WebSocket connection
        } else if (command === 'logout') {
            sendOMMmessage(data.commandObj);
            disconnect(); //Terminate WebSocket connection
        } else {
            sendOMMmessage(data.commandObj);
        }
        //self.postMessage(response);

    }, false);

    /* -----------------  Application events functions  ----------------- */

    //Establish WebSocket connection
    function connect(commandObj) {
        ws = new WebSocket(commandObj.serverurl, commandObj.protocol);
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onerror = onError;
        ws.onclose = onClose;
    }

    function disconnect() {
        ws.close();

        var disconnect_response = {
            'command': 'disconnect',
            'msg': 'Disconnected'
        };
        self.postMessage(disconnect_response);
    }

    //Send message to ADS WebSocket
    function sendOMMmessage(commandObj) {
        ws.send(JSON.stringify(commandObj));
    }

    /* -----------------  WS events  ----------------- */

    //Establish WebSocket connection success
    function onOpen(event) {
        var onOpen_response = {
            'command': 'connect',
            'msg': 'Connected'
        };
        self.postMessage(onOpen_response);
    }
    //Receives incoming message from WebSocket
    function onMessage(event) {
        let incomingdata = JSON.parse(event.data.toString());
        //Iterate each JSON message and send it to market_price_app.js
        for (let index = 0; index < incomingdata.length; index++) {

            onMessage_response.msg = incomingdata[index];
            self.postMessage(onMessage_response);
        }
    };

    function onError(event) {
        var onError_response = {
            'command': 'error',
            'msg': event
        };
        self.postMessage(onError_response);
    };

    function onClose(event) {
        var onClose_response = {
            'command': 'close',
            'msg': 'WebSocket Closed'
        };
        self.postMessage(onClose_response);
    };

})();

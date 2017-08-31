(function () {

    let ws = null;
    const protocol = 'tr_json2';

    let onMessage_response = {
        'command': 'incomingMsg',
        'msg': null
    };

    self.addEventListener('message', function (e) {
        let data = e.data;
        let command = data.command;
        if (command === 'connect') {
            connect(data.commandObj);
        } else if(command === 'logout'){
            sendOMMmessage(data.commandObj);
            disconnect();
        } else {
            sendOMMmessage(data.commandObj);
        }
        //self.postMessage(response);

    }, false);

    //Application events functions
    function connect(commandObj) {
        ws = new WebSocket(commandObj.serverurl, commandObj.protocol);
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onerror = onError;
        ws.onclose = onClose;
    }

    function disconnect(){
        ws.close();
    }

    function sendOMMmessage(commandObj) {
        ws.send(JSON.stringify(commandObj));
    }

    //WS events
    function onOpen(event) {
        var onOpen_response = {
            'command': 'connect',
            'msg': 'Connected'
        };
        self.postMessage(onOpen_response);
    }

    function onMessage(event) {
        let incomingdata = JSON.parse(event.data.toString());
        for (let index = 0; index < incomingdata.length; index++) {
            //processData(incomingdata[index]);
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

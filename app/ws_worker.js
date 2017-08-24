(function () {

    let ws = null;
    const protocol = 'tr_json2';

    self.addEventListener('message', function (e) {
        let data = e.data;
        let command = data.command;
        

        if(command === 'connect'){
            connect(data);
        }else if(command === 'login'){
            sendLoginrequest(data);
        }
        //self.postMessage(response);

    }, false);

    function connect(data) {
        ws = new WebSocket(data.wsinfo.serverurl, data.wsinfo.protocol);
        
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onerror = onError;
        ws.onclose = onClose;
    }

    function sendLoginrequest(data) {
        self.postMessage(data);
        ws.send(JSON.stringify(data.loginMsg));
    }

    //WS events
    function onOpen(event) {
        var onOpen_response ={
            'command': 'connect',
            'msg': 'Connected'
        };
        self.postMessage(onOpen_response);
    }

    function onMessage(event) {
        //console.log(event);

        var onMessage_response = {
            'command' : 'incomingMsg',
            'msg': event.data
        };
        self.postMessage(onMessage_response);
    };

    function onError(event) {
        
    };

    function onClose(event) {
        
    };

})();

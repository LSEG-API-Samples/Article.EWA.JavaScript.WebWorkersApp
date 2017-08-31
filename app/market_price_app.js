(function ($) {
    //variables
    var serverurl = '',
        username = '',
        ws = null,
        itemID = 0,
        wk = new Worker("./app/ws_worker.js");
    const protocol = 'tr_json2';
    const loginID = 1;

    wk.addEventListener("message", function (oEvent) {

        let response = oEvent.data;
        let command = response.command;
        //console.log('receive data from Web Worker: ' + JSON.stringify(response));
        if (command === 'connect') {
            processConnectionEvent(response);
        } else if (command === 'incomingMsg') {
            processData(response.msg);
        }

        //console.log(oEvent.data);
    }, false);

    function processConnectionEvent(response) {
        //console.log('Connect' + JSON.stringify(response));
        $('#btnConnect').html(response.msg);
    }

    //Process incoming messages
    function processData(data) {
        let msgtype = data.Type;

        //Clear previous message
        $('#messagesPre').html('');
        if (msgtype === 'Refresh') {
            if (data.Domain === 'Login') {
                //$('#btnSubscribe').prop('disabled', false); //Login Refresh_resp
                $('#messagesPre').html('Receive: Login REFRESH_RESP:<br/>'); //Login Refresh_resp
            } else {
                $('#messagesPre').html('Receive: Data REFRESH_RESP:<br/>'); //Data Refresh_resp
            }
            $('#messagesPre').html(`${$('#messagesPre').html()} ${JSON.stringify(data, undefined, 2)}`); //IE10 does not support JS Template literals
            
        } else if (msgtype === 'Update') {
            //$('#messagesPre').html(JSON.stringify(data, undefined, 2)); //Update_resp
            $('#messagesPre').html(`Receive: UPDATE_RESP:<br/> ${JSON.stringify(data, undefined, 2)}`); //Status_resp
        } else if (msgtype === 'Status') {
            $('#messagesPre').html(`Receive: STATUS_RESP:<br/> ${JSON.stringify(data, undefined, 2)}`); //Status_resp
        } else if (msgtype === 'Ping') {
            $('#messagesPre').html(`Recieve Ping:</br> ${JSON.stringify(data, undefined, 2)}`); //Server Ping
            sendPong();
        }
    }

    //UI interaction
    $(document).ready(function () {


        $('#btnConnect').click(function () {

            serverurl = `ws://${$('#txtServerurl').val()}/WebSocket`;
            //serverurl = 'ws://' + $('#txtServerurl').val() + '/WebSocket';
            //console.log('connecting to ' + serverurl);
            connect(serverurl);
        });

        $('#btnLogin').click(function () {
            let username = $('#txtUsername').val();
            sendLoginrequest(username);
        });

        $('#btnSubscribe').click(function () {
            let servicename = $('#txtServiceName').val();
            let itemname = $('#txtItemName').val();
            sendItemrequest(servicename, itemname);
        });

        $('#btnUnSubscribe').click(function () {
            sendItemCloserequest();
        });

        $('#btnLogout').click(function () {
            sendLoginCloserequest();
        });


    });

    function connect(serverurl) {

        $('#commandsPre').html(`ws = new WebSocket('${serverurl}', '${protocol}');`);

        let connectObj = {
            'commandObj': {
                'serverurl': serverurl,
                'protocol': protocol
            },
            'command': 'connect'
        };

        wk.postMessage(connectObj);
    }

    function sendLoginrequest(username) {
        //Create Login request message
        let loginMsg = {
            'Id': loginID,
            'Domain': 'Login',
            'Key': {
                'Elements': {
                    'ApplicationId': '256',
                    'Position': '127.0.0.1'
                },
                'Name': ''
            }
        };
        loginMsg.Key.Name = username;
        //console.log("Sending login request message for " + JSON.stringify(loginMsg));
        //$('#commandsPre').html(`Sending Login: ws.send(${JSON.stringify(loginMsg, undefined, 2)});`);
        $('#commandsPre').html(`Sending Login request message to Web Workers: WebWorkers.post(${JSON.stringify(loginMsg, undefined, 2)});`);

        let loginObj = {
            'commandObj': loginMsg,
            'command': 'login'
        }

        wk.postMessage(loginObj);
    }

    function sendItemrequest(service, itemname) {
        if (itemID === 0) {
            itemID = loginID + 1;
        } else {
            itemID += 1;
        }
        //create Market Price request message
        let itemrequestMsg = {
            'Id': itemID,
            'Key': {
                'Name': itemname,
                'Service': service
            }
        };

        let itemrequestObj = {
            'commandObj': itemrequestMsg,
            'command': 'requestitem'
        }

        //console.log("Sending item request message for " + JSON.stringify(itemrequestMsg));

        wk.postMessage(itemrequestObj);

        // $('#commandsPre').html(`Sending Item Request: ws.send(${JSON.stringify(itemrequestMsg, undefined, 2)});`);
        $('#commandsPre').html(`Sending Item request message to Web Workers: WebWorkers.post(${JSON.stringify(itemrequestMsg, undefined, 2)});`);
        //$('#btnUnSubscribe').prop('disabled', false);
    }

    function sendItemCloserequest() {
        let closeitemrequestMsg = {
            'Id': itemID,
            'Type': 'Close'
        };

        let closeitemrequestObj = {
            'commandObj': closeitemrequestMsg,
            'command': 'closeitem'
        }

        wk.postMessage(closeitemrequestObj);

        //console.log("Sending close item request message for " + JSON.stringify(closeitemrequestMsg));
        //$('#messagesPre').html('Sending Item Close Request: ws.send('+JSON.stringify(closeitemrequestMsg, undefined, 2)+');');
        $('#commandsPre').html(`Sending Item Close request message to Web Workers: WebWorkers.post(${JSON.stringify(closeitemrequestMsg, undefined, 2)});`);

    }

    function sendPong() {

        let pongObj = {
            'commandObj': { 'Type': 'Pong' },
            'command': 'pong'
        }
        wk.postMessage(pongObj);

        //$('#messagesPre').html(`Sending Pong:<br/> ${JSON.stringify({ 'Type': 'Pong' }, undefined, 2)}`); //Ping
        $('#commandsPre').html(`Sending Client Pong: ws.send(${JSON.stringify({ 'Type': 'Pong' }, undefined, 2)});`);
    }

    function sendLoginCloserequest() {
        let closeloginrequestMsg = {
            'Domain': 'Login',
            'Id': loginID,
            'Type': 'Close'
        };

        let closeloginrequestObj = {
            'commandObj': closeloginrequestMsg,
            'command': 'logout'
        }

        wk.postMessage(closeloginrequestObj);

        //console.log("Sending close login request message for " + JSON.stringify(closeloginrequestMsg));
        $('#commandsPre').html(`Sending Login Close Request: ws.send(${JSON.stringify(closeloginrequestMsg, undefined, 2)});`);

    }

})($);
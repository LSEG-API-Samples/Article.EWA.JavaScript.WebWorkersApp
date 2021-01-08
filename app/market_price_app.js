//|-----------------------------------------------------------------------------
//|            This source code is provided under the Apache 2.0 license      --
//|  and is provided AS IS with no warranty or guarantee of fit for purpose.  --
//|                See the project's LICENSE.md for details.                  --
//|           Copyright Refinitiv 2017.       All rights reserved.            --
//|-----------------------------------------------------------------------------


//******************************************************************************************/
// The market_price_app.js is a main application file. 
// It handles all UI interactions. 
// It sends and receives messages with ws_workers.js file to communicate with Refinitiv Real-Time Advanced Distribution Server  WebSocket.

// Author: Wasin Waeosri
// Version: 1.0
// Date: 7 November 2017
//******************************************************************************************/
(function ($) {
    //Define variables
    var serverurl = '',
        username = '',
        itemID = 0,
        wk = new Worker("./app/ws_workers.js");
    const protocol = 'tr_json2';
    const loginID = 1;

    /* -----------------  UI Events  ----------------- */
    $(document).ready(function () {

        $('#btnConnect').click(function () {
            // serverurl = `ws://${$('#txtServerurl').val()}/WebSocket`;
            serverurl = 'ws://' + $('#txtServerurl').val() + '/WebSocket';
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

    /* -----------------  Web Workers Events  ----------------- */

    //Receive events from Web Workers ws_worker.js file
    wk.addEventListener("message", function (oEvent) {

        let response = oEvent.data;
        //Get command parameter to identify operation
        let command = response.command;

        if (command === 'connect') { //WebSocket connection event
            processConnectionEvent(response);
        } else if (command === 'incomingMsg') { //Receive incoming messages from ADS WebSocket
            processData(response.msg);
        } else if(command === 'disconnect') { //Receive Disconnect sucess from ADS WebSocket
            $('#btnConnect').html('Connect');
        }

    }, false);

    function processConnectionEvent(response) {
        $('#btnConnect').html(response.msg);
    }

    //Process incoming messages from ADS WebSocket
    function processData(data) {
        let msgtype = data.Type;

        //Clear previous message
        $('#messagesPre').html('');
        //If incoming message is REFRESH_RESP
        if (msgtype === 'Refresh') {

            if (data.Domain === 'Login') {
                $('#messagesPre').html('Receive: Login REFRESH_RESP:<br/>'); //Login Refresh_resp
            } else {
                $('#messagesPre').html('Receive: Data REFRESH_RESP:<br/>'); //Data Refresh_resp
            }
            //$('#messagesPre').html(`${$('#messagesPre').html()} ${JSON.stringify(data, undefined, 2)}`); //IE10 does not support JS Template literals
            $('#messagesPre').html($('#messagesPre').html() + JSON.stringify(data, undefined, 2)); //Display REFRESH_RESP
        } else if (msgtype === 'Update') { //If incoming message is UPDATE_RESP

            //$('#messagesPre').html(`Receive: UPDATE_RESP:<br/> ${JSON.stringify(data, undefined, 2)}`); //Update_resp
            $('#messagesPre').html('Receive: UPDATE_RESP:<br/>' + JSON.stringify(data, undefined, 2)); //Display Update_resp
        } else if (msgtype === 'Status') {//If incoming message is STATUS_RESP

            //$('#messagesPre').html(`Receive: STATUS_RESP:<br/> ${JSON.stringify(data, undefined, 2)}`); //Status_resp
            $('#messagesPre').html('Receive: STATUS_RESP:<br/>' + JSON.stringify(data, undefined, 2)); //Display Status_resp
        } else if (msgtype === 'Error'){//If incoming message is ERROR_RESP
            $('#messagesPre').html('Receive: ERROR_RESP:<br/>' + JSON.stringify(data, undefined, 2)); //Display Status_resp
        } else if (msgtype === 'Ping') { //If incoming message is PING (server ping)

            //$('#messagesPre').html(`Recieve Ping:</br> ${JSON.stringify(data, undefined, 2)}`); //Server Ping
            $('#messagesPre').html('Recieve Ping:</br>' + JSON.stringify(data, undefined, 2)); //Server Ping
            sendPong();
        }
    }

    /* -----------------  WebSocket functions  ----------------- */
    //Establish WebSocket connection
    function connect(serverurl) {

        //$('#commandsPre').html(`ws = new WebSocket('${serverurl}', '${protocol}');`);
        $('#commandsPre').html('ws = new WebSocket("' + serverurl + '", "' + protocol + '");');
        let connectObj = {
            'commandObj': {
                'serverurl': serverurl,
                'protocol': protocol
            },
            'command': 'connect'
        };
        //Send message to Web Workers
        wk.postMessage(connectObj);
    }

    //Send a Login Request message to ADS WebSocket
    function sendLoginrequest(username) {
        //Create Login request message
        let loginMsg = {
            'ID': loginID,
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

        //$('#commandsPre').html(`Sending Login request message to Web Workers: WebWorkers.post(${JSON.stringify(loginMsg, undefined, 2)});`);
        $('#commandsPre').html('Sending Login request message to Web Workers: WebWorkers.post(' + JSON.stringify(loginMsg, undefined, 2) + ');');
        let loginObj = {
            'commandObj': loginMsg,
            'command': 'login'
        }
        //Send Login message to Web Workers
        wk.postMessage(loginObj);
    }

    //Send Item Request message to ADS WebSocket
    function sendItemrequest(service, itemname) {
        //Create stream ID, must not be 1 (Login)
        if (itemID === 0) {
            itemID = loginID + 1;
        } else {
            itemID += 1;
        }

    
        //create Market Price request message, if user does not set service name, let the ADS use default service
        let itemrequestMsg = {
            'ID': itemID,
            'Key': {
                'Name': itemname
            }
        };
        //if user set service name, request interested service name 
        if(service !==''){
            itemrequestMsg.Key.Service = service
        } 

        let itemrequestObj = {
            'commandObj': itemrequestMsg,
            'command': 'requestitem'
        }
        //Send Item Request message to Web Workers
        wk.postMessage(itemrequestObj);

        //$('#commandsPre').html(`Sending Item request message to Web Workers: WebWorkers.post(${JSON.stringify(itemrequestMsg, undefined, 2)});`);
        $('#commandsPre').html('Sending Item request message to Web Workers: WebWorkers.post(' + JSON.stringify(itemrequestMsg, undefined, 2) + ');');
    }

    //Send Item Close Request message to ADS WebSocket
    function sendItemCloserequest() {

        let closeitemrequestMsg = {
            'ID': itemID,
            'Type': 'Close'
        };

        let closeitemrequestObj = {
            'commandObj': closeitemrequestMsg,
            'command': 'closeitem'
        }
        //Send Item Close Request message to Web Workers
        wk.postMessage(closeitemrequestObj);

        //$('#commandsPre').html(`Sending Item Close request message to Web Workers: WebWorkers.post(${JSON.stringify(closeitemrequestMsg, undefined, 2)});`);
        $('#commandsPre').html('Sending Item Close request message to Web Workers: WebWorkers.post('
            + JSON.stringify(closeitemrequestMsg, undefined, 2) +
            ');');
    }

    //Send { 'Type': 'Pong' } for acknowledge Server PING
    function sendPong() {

        let pongObj = {
            'commandObj': { 'Type': 'Pong' },
            'command': 'pong'
        }
        //Send PONG message to Web Workers
        wk.postMessage(pongObj);

        //$('#commandsPre').html(`Sending Client Pong: ws.send(${JSON.stringify({ 'Type': 'Pong' }, undefined, 2)});`);
        $('#commandsPre').html('Sending Client Pong to Web Workers: WebWorkers.post(' + JSON.stringify({ 'Type': 'Pong' }, undefined, 2) + ');');
    }

    //Send Login Close Request message to ADS WebSocket
    function sendLoginCloserequest() {
        let closeloginrequestMsg = {
            'Domain': 'Login',
            'ID': loginID,
            'Type': 'Close'
        };

        let closeloginrequestObj = {
            'commandObj': closeloginrequestMsg,
            'command': 'logout'
        }
        //Send Login Close Request message to Web Workers
        wk.postMessage(closeloginrequestObj);

        //$('#commandsPre').html(`Sending Login Close Request: ws.send(${JSON.stringify(closeloginrequestMsg, undefined, 2)});`);
        $('#commandsPre').html('Sending Login Close Request to Web Workers: WebWorkers.post(' + JSON.stringify(closeloginrequestMsg, undefined, 2) + ');');
    }

})($);
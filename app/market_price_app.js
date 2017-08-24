(function ($) {
    //variables
    var serverurl = '',
        username = '',
        ws = null,
        itemID = 0,
        wk = new Worker("./app/ws_worker.js");
    const protocol = 'tr_json2';
    const loginID = 0;

    wk.addEventListener("message", function (oEvent) {
        //document.getElementById('display').textContent = oEvent.data;
        //จะ print 'worker got : Hello'
        let response = oEvent.data;
        let command = response.command;
        console.log('receive data from Web Worker: ' + JSON.stringify(response));
        if (command === 'connect') {
            processConnectionEvent(response);
        }else if(command === 'incomingMsg'){
            processIncomingEvent(response);
        }

        console.log(oEvent.data);
    }, false);

    function processConnectionEvent(response) {
        console.log('Connect!!' + JSON.stringify(response));
        $('#btnConnect').html(response.msg);
    }

    function processIncomingEvent(response){
        let incomingdata = JSON.parse(response.msg.toString());
        for (let index = 0; index < incomingdata.length; index++) {
            processData(incomingdata[index]);
        }
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
            $('#messagesPre').html(`${$('#messagesPre').html()} ${JSON.stringify(data, undefined, 2)}`); //Server Ping
        } else if (msgtype === 'Update') {
            $('#messagesPre').html(JSON.stringify(data, undefined, 2)); //Update_resp

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
            //serverurl = $('#serverurl').val();
            serverurl = `ws://${$('#txtServerurl').val()}/WebSocket`;
            console.log('connecting to ' + serverurl);
            connect(serverurl);
        });

        $('#btnLogin').click(function () {
            let username =  $('#txtUsername').val();
            sendLoginrequest(username);
        });

        $('#btnSubscribe').click(function () {

        });

        $('#btnUnSubscribe').click(function () {

        });

        $('#btnLogout').click(function () {

        });


    });

    function connect(serverurl) {

        $('#commandsPre').html(`ws = new WebSocket('${serverurl}', '${protocol}');`);

        let connectObj = {
            'wsinfo': {
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
        loginMsg.Key.Name =username;
        console.log("Sending login request message for " + JSON.stringify(loginMsg));
        $('#commandsPre').html(`Sending Login: ws.send(${JSON.stringify(loginMsg, undefined, 2)});`);

        let loginObj = {
            'loginMsg': loginMsg,
            'command': 'login'
        }

        wk.postMessage(loginObj);
    }

})($);
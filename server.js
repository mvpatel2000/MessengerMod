//npm install formidable@latest --save
//npm install facebook-chat-api

var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var login = require("facebook-chat-api");

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        //processAllFieldsOfTheForm(req, res);
        processFormFieldsIndividual(req, res);
    }
});

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received the data:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });
}

function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    //Call back when each field in the form is parsed.
    form.on('field', function (field, value) {
        fields[field] = value;
    });

    //Call back when each file in the form is parsed.
    form.on('file', function (name, file) {
        fields[name] = file;
        //Storing the files meta in fields array.
        //Depending on the application you can process it accordingly.
    });

    //Call back for file upload progress.
    form.on('progress', function (bytesReceived, bytesExpected) {
        var progress = {
            type: 'progress',
            bytesReceived: bytesReceived,
            bytesExpected: bytesExpected
        };
        console.log(progress);
        //Logging the progress on console.
        //Depending on your application you can either send the progress to client
        //for some visual feedback or perform some other operation.
    });

    //Call back at the end of the form.
    form.on('end', function () {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('Color updating!');
        res.end();

        var USERNAME = fields["username"];
        var PASSWORD = fields["password"];
        var TARGET = fields["target"];
        var INFO = fields["info"];

        login({email: USERNAME, password: PASSWORD}, function callback (err, api) {
            if(err) return console.error(err);

            api.getUserID(TARGET, function(err, data) {
                if(err) return callback(err);

                var TARGET = data[0].userID;
                console.log(TARGET);

                console.log("Changing the color...");
                if(!(INFO.charAt(0)+""=="#")) {
                    var color = "#"+INFO; //#eb42f4
                }
                api.changeThreadColor(color, TARGET, function callback(err) {
                    if(err) return console.error(err);
                });
                // api.changeThreadEmoji("💯", TARGET, function callback(err) {
                //     if(err) return console.error(err);
                // });

            });    
        });


    });
    form.parse(req);
}

server.listen(process.env.PORT);
//server.listen(1185);
//console.log("server listening on 1185");
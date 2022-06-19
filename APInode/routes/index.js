var express = require('express');
var router = express.Router();
const fs = require('fs');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;  

const passwords = JSON.parse(fs.readFileSync('./passwords.json', {encoding:'utf8'}));

var config = {  
    server: 'beschin.database.windows.net',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: passwords["AzureDB"]["username"], //update me
            password: passwords["AzureDB"]["password"]  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'ParcheggioDB'  //update me
    }
};  
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    console.log("Connected");  
});

connection.connect();

router.put('/stato/:idEsp', (req, res) => {
    request = new Request("UPDATE TPosti SET presenza = @statoEsp WHERE ID_posto = @idEsp", function(err) {  
        if (err) {  
           console.log(err);}  
       });  
       request.addParameter('idEsp', TYPES.VarChar, req.params.idEsp);  
       request.addParameter('statoEsp', TYPES.Bit , req.body.statoEsp);  
       request.on('row', function(columns) {  
           columns.forEach(function(column) {  
             if (column.value === null) {  
               console.log('NULL');  
             } else {  
               console.log("Product id of inserted item is " + column.value);  
             }  
           });  
       });

       // Close the connection after the final event emitted by the request, after the callback passes
       request.on("requestCompleted", function (rowCount, more) {
        res.end();
       });
       connection.execSql(request);  
});

router.put('/stato', (req, res) => {
    var commandSql = "";
    req.body.forEach(item => {
        commandSql += `UPDATE Tposti SET presenza = ${item.statoEsp} WHERE ID_posto = ${item.idEsp};`;
    });
    
    var request = new Request(commandSql, function(err) {  
        if (err) {  
           console.log(err);}  
       });  
    //    request.addParameter('idEsp', TYPES.VarChar, item.idEsp);  
    //    request.addParameter('statoEsp', TYPES.Bit , item.statoEsp);  
       request.on('row', function(columns) {  
           columns.forEach(function(column) {  
             if (column.value === null) {  
               console.log('NULL');  
             } else {  
               console.log("Product id of inserted item is " + column.value);  
             }  
           });  
       });

       // Close the connection after the final event emitted by the request, after the callback passes
       request.on("requestCompleted", function (rowCount, more) {
        res.end();
       });
       
    connection.execSql(request);  
});


router.get('/stato/:idEsp', (req, res) => {
    request = new Request("SELECT presenza FROM TPosti WHERE ID_posto = @idEsp", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    request.addParameter('idEsp', TYPES.VarChar, req.params.idEsp);
    var result = "";  
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
            if (column.value === null) {  
            console.log('NULL');  
            } else {  
            result+= column.value + " ";  
            }  
        });  
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});

router.get('/lista', (req, res) => {
    request = new Request("SELECT ID_posto, presenza FROM TPosti", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    var result = [];
    
    request.on('row', function(columns) { 
        var tmp = {};
        tmp.ID_posto = columns[0].value;
        tmp.presenza = columns[1].value;
        result.push(tmp);
    });  

    request.on('done', function(rowCount, more) {
        console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});

router.get('/lista/terra', (req, res) => {
    request = new Request("SELECT * FROM TPosti WHERE LEFT(ID_Posto,1) = '0'", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    var result = [];
    
    request.on('row', function(columns) { 
        var tmp = {};
        tmp.ID_posto = columns[0].value;
        tmp.presenza = columns[1].value;
        result.push(tmp);
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});

router.get('/lista/primo', (req, res) => {
    request = new Request("SELECT * FROM TPosti WHERE LEFT(ID_Posto,1) = '1'", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    var result = [];
    
    request.on('row', function(columns) { 
        var tmp = {};
        tmp.ID_posto = columns[0].value;
        tmp.presenza = columns[1].value;
        result.push(tmp);
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});

router.get('/lista/posti_occupati', (req, res) => {
    request = new Request("SELECT ID_posto FROM TPosti WHERE presenza = 1", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    var result = [];
    
    request.on('row', function(columns) { 
        result.push(columns[0].value);
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});


router.get('/tempoMedio', (req, res) => {
    request = new Request("SELECT * FROM Tempo_Medio_Affluenza", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    var result;
    
    request.on('row', function(columns) { 
        result = columns[0].value;
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});

router.get('/countPosti', (req, res) => {
    request = new Request("SELECT COUNT(ID_posto) FROM TPosti WHERE presenza = 1", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    var result;
    
    request.on('row', function(columns) { 
        result = columns[0].value;
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        res.json(result);
    });
    connection.execSql(request); 
});

module.exports = router;
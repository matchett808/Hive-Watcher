var https = require('https');
var config = require("./config.js");
var mqtt = require("mqtt")
var secret = {
    "sessions": [{
        "username": config.username,
        "password": config.password,
        "caller": "WEB"
    }]
}
var client = mqtt.connect(config.mqtturl, config.mqttoptions)
var querystring = require("querystring")
var api_key = '';
var motionsensors = [];
var watcher = null;
var run = function()
{
    const postData = JSON.stringify(secret);
    
    var options = {
      host: 'api-prod.bgchprod.info',
      path: '/omnia/auth/sessions',
      method: "post",
      port: '443',
      //This is the only line that is new. `headers` is an object with the headers to request
      headers: {
        "Accept": "application/vnd.alertme.zoo-6.0.0+json",
        "X-Omnia-Client": "DEV",
        "Content-Type": "application/json"
      }
    };
    
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
        body ='' 
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
          store_secret(JSON.parse(body).sessions[0].id);
          if(watcher === null )
          {
              get_nodes();
          }
          
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();

}
var store_secret = function(sec)
{
    api_key = sec;
}
var get_nodes = function()
{
    
    var options = {
      host: 'api-prod.bgchprod.info',
      path: '/omnia/nodes',
      method: "get",
      port: '443',
      //This is the only line that is new. `headers` is an object with the headers to request
      headers: {
        "Accept": "application/vnd.alertme.zoo-6.0.0+json",
        "X-Omnia-Client": "DEV",
        /*"Content-Type": "application/json",*/
        "X-Omnia-Access-Token": api_key
      }
    }
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
        body ='' 
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
          parse_nodes(JSON.parse(body) );
      });
    });
    req.end();

    
}
var array_contains = function (tgt, arr)
{
    for(var i=0; i< tgt.length; i++)
    {
        if(tgt[i].name === arr)
        {
            return true;
        }
    }
    return false;
}
var parse_nodes = function(nodelist)
{
    //node.class.motion.sensor
    var nodes = nodelist.nodes;
    for(var i=0; i< nodes.length; i++)
    {
        
        if(nodes[i].nodeType == 'http://alertme.com/schema/json/node.class.motion.sensor.json#' ||
         array_contains(config.monitor, nodes[i].name) )
        {
            motionsensors.push(nodes[i].id)
            if(watcher === null)
                {
                    
                    watcher = setInterval(watchformotion, config.pollingfrequency);
                }
        }
    }
    
}
var watchformotion = function()
{
    for(var i=0; i< motionsensors.length; i++)
    {
        poll(motionsensors[i]);
    }
}
var poll = function(msobj)
{
    var options = {
      host: 'api-prod.bgchprod.info',
      path: '/omnia/nodes/' + msobj,
      method: "get",
      port: '443',
      //This is the only line that is new. `headers` is an object with the headers to request
      headers: {
        "Accept": "application/vnd.alertme.zoo-6.0.0+json",
        "X-Omnia-Client": "DEV",
        /*"Content-Type": "application/json",*/
        "X-Omnia-Access-Token": api_key
      }
    }
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
        body ='' 
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
          var attr = JSON.parse(body).nodes[0].attributes;
        if(JSON.parse(body).nodes[0].nodeType == 'http://alertme.com/schema/json/node.class.motion.sensor.json#')
            {
                var obj = {};
                obj.motion = attr.inMotion.reportedValue;
                obj.temperature = attr.temperature.reportedValue;
              report(JSON.parse(body).nodes[0].name, obj);
            }
          else
          {
              var obj = {}
              var name = '';
              for(var i = 0; i < config.monitor.length; i++)
              {
                  if(config.monitor[i].name == JSON.parse(body).nodes[0].name)
                  {
                      name = config.monitor[i].name;
                      for(var j = 0; j < config.monitor[i].attributes.length; j++ )
                      {
                          var attr = config.monitor[i].attributes[j];
                          obj[attr] = JSON.parse(body).nodes[0].attributes[attr].reportedValue
                      }
                  }
              }
              report(name, obj);
          }
      });
    });
    req.end();

    
}
var report = function (n, obj)
{
    
  client.publish('hive/'+n, JSON.stringify(obj))
    return;
}
run();
setInterval(run, 1800000);
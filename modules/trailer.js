var request = require("request")
var tulem = [] // kõik tulemused siia
var temp = [] //hoian viimaseid tulemusi siin, et need ei korduks

function trailer(callback) {
 
    var options = {
        uri: "https://www.reddit.com/r/trailers/hot.json?limit=100",
        json: true
    }
    request(options, function (error, response, body) {
        if (error) {
            console.log(error)
        }
        else {
    body.data.children.forEach(function(el){
        if(el.data.domain === "youtube.com") {
            tulem.push(el.data.title + " " + el.data.url)
            } 
        
        })

    var vastus = tulem[Math.floor(Math.random()*tulem.length)]

    while (temp.indexOf(vastus) > -1) {  
    vastus = tulem[Math.floor(Math.random()*tulem.length)]
    }

    temp.push(vastus)
    while(temp.length > 35){
        temp.splice(0, 1)
        }
    
    callback(vastus)            
            
        };
    });
}

module.exports = trailer
let express = require('express')
let anchorme = require("anchorme").default
let fs = require('fs')
let trailer = require('./modules/trailer.js')
let ilm = require('./modules/ilm.js')
let history = require("./data.json").history || []
let topic = require("./data.json").topic || ""
var socketio = require('socket.io');
module.exports = function (server) {
    var io = socketio.listen(server);
    function pushAndEmit(obj) {
        io.sockets.emit("bot", obj)
        let save = require("./data.json")
        save.history.push(obj)
        fs.writeFile("./data.json", JSON.stringify(save, null, 4))
    }
    io.on("connection", function(socket) {
        socket.emit('oldchat', {
            "arr": history.slice(-30)
        })
        socket.emit('topic', require("./data.json").topic)
        socket.on("namechange", function(data) {
            io.sockets.emit("namechange", data)
            let save = require("./data.json")
            save.history.push(data)
            fs.writeFile("./data.json", JSON.stringify(save, null, 4))
        })
        socket.on("chat", function(data) {
            data.message = ankur(data.message)
            let obj = {
                name: "Bot",
            }
            socket.emit("chat", data)
            delete data.self;
            socket.broadcast.emit("chat", data)
            let jupp = murrakaheks(data.message)
            if (jupp[0] === "!ilm") {
                ilm(jupp[1], function(ilm) {
                    obj.message = ilm
                    obj.time = time()
                    pushAndEmit(obj)
                })
            }
            if (jupp[0] === "!topic") {
                topic = io.sockets.emit("topic", "Teema: " + jupp[1])
                io.sockets.emit("bot", {name: "Bot", message: "Teema on nüüd: " +jupp[1], time: time()})
                let save = require("./data.json")
                save.topic = "Teema: " + jupp[1]
                fs.writeFile("./data.json", JSON.stringify(save, null, 4))
            }
            if (data.message === "!filmisoovitus") {
                trailer(function(film) {
                    obj.message = ankur(film)
                    obj.time = time()
                    pushAndEmit(obj)
                })
            }
            let save = require("./data.json")
            save.history.push(data)
            fs.writeFile("./data.json", JSON.stringify(save, null, 4))
        })
    })
};
function murrakaheks(sisend) {
    let output = [sisend.replace(/\s.*/, ''), sisend.replace(/\S+\s/, '')]; //rida kaheks pärast esimest tühikut
    return output;
}
function time() {
    let d = new Date(),
        h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
    return h + ':' + m + ':' + s;
}
function ankur(data) {
    data = anchorme(data, {
        attributes: [
            {
                name: "class",
                value: "link"
		},
		function(urlObj) {
                if (urlObj.reason === "ip") return { name: "class", value: "ip-link" };
		},
		function(urlObj) {
                if (urlObj.protocol !== "mailto:") return { name: "target", value: "blank" };
		}
	]
    })
    return data;
}
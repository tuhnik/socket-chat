var socket = io.connect()
var output = document.getElementById("output")
var message = document.getElementById("message")
var username = document.getElementById("name")
var messagehistory = []
message.focus()
var suvakasutajad = ["Suvanimi1", "Suvanimi2", "Suvanimi" + Math.floor(Math.random() * 43)]
var suvapealkiri = ["Teema1", "Teema2", "Teema3"]
username.value = window.localStorage.getItem("name") || suvakasutajad[Math.floor(Math.random() * suvakasutajad.length)]
window.localStorage.setItem("name", username.value)
    // output.innerHTML = '<div class = "headline">' + suvapealkiri[Math.floor(Math.random() * suvapealkiri.length)] + '</div>'
output.innerHTML = '<div class = "headline"><br></div>'
username.addEventListener("click", function() {
    username.value = ""
})
username.addEventListener("blur", function() {
    if (username.value) {
        var oldname = window.localStorage.getItem("name")
        window.localStorage.setItem("name", username.value)
        socket.emit("namechange", {
            time: time(),
            oldname: oldname,
            newname: username.value
        })
    } else {
        username.value = window.localStorage.getItem("name")
    }
})
var counter = 0
message.addEventListener("keyup", function(ev) {
    if (ev.key == "Enter") {
        counter = messagehistory.length + 1
        messagehistory.push(message.value)
        socket.emit("chat", {
            time: time(),
            name: username.value,
            message: message.value,
            self: true
        })
        message.value = "";
    }
    if (ev.key == "ArrowUp") {
        counter--
        if (counter < 0) {
            counter = 0
        }
        if (messagehistory.length) {
            message.value = messagehistory[counter]
        }
    }
    if (ev.key == "ArrowDown") {
        counter++
        if (counter > messagehistory.length - 1) {
            message.value = ""
            counter = messagehistory.length
            console.log(counter)
        } else {
            message.value = messagehistory[counter]
            console.log(counter)
        }
    }
})
document.addEventListener('focus', function(e) { document.title = "Jututuba" }, true);
socket.on("oldchat", function(data) {
    data.arr.forEach(function(el) {
        if (el.newname && el.oldname) {
            output.innerHTML += '<div class = "vanad">[' + el.time + "] " + el.oldname + " on nüüd " + el.newname + '!<br></div>'
        } else {
            output.innerHTML += '<div class = "vanad">[' + el.time + "] " + el.name + ": " + el.message + '<br></div>'
        }
    })
    output.scrollTop = output.scrollHeight - output.clientHeight;
})
socket.on("bot", function(data) {
    output.innerHTML += '<div class = "rida bot">[' + data.time + "] " + data.name + ": " + data.message + '<br></div>'
    output.scrollTop = output.scrollHeight - output.clientHeight;
})
socket.on("topic", function(data) {
    if (data.length > 1) {
        document.getElementsByClassName("headline")[0].innerHTML = data
    }
})
socket.on("namechange", function(data) {
    output.innerHTML += '<div class = "rida namechange">[' + data.time + "] " + data.oldname + " on nüüd " + data.newname + '!<br></div>'
    output.scrollTop = output.scrollHeight - output.clientHeight;
})
socket.on("chat", function(data) {
    if (data.self) {
        output.innerHTML += '<div class = "rida self">[' + data.time + "] " + data.name + ": " + data.message + '<br></div>'
    } else {
        output.innerHTML += '<div class = "rida">[' + data.time + "] " + data.name + ": " + data.message + '<br></div>'
        if (!window.onfocus) {
            document.title = "Jututuba - uus teade!"
        }
    }
    output.scrollTop = output.scrollHeight - output.clientHeight;
})

function time() {
    var d = new Date(),
        h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
    return h + ':' + m + ':' + s;
}
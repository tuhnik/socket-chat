module.exports = function ilm(linn, logresult) {
    linn = linn.replace(/!ilm/gi, "tallinn")
    linn = linn.replace(/ö/gi, "o")
    linn = linn.replace(/ä/gi, "a")
    linn = linn.replace(/ü/gi, "u")
    linn = linn.replace(/õ/gi, "o")
    var request = require('request'),
        url = "http://autocomplete.wunderground.com/aq?query=" + linn
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body)
            if (data.RESULTS[0]) {
                ilmaleidmine(data.RESULTS[0].zmw, logresult)
            }
            else {
                
                logresult("Linna ei leitud!")
            }
        }
        else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })
}

function ilmaleidmine(zmw, callback) {
    var request = require('request'),
        url = "http://api.wunderground.com/api/d1d53d583b684d6a/conditions/forecast/q/zmw:" + zmw + ".json"
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200 && callback) {
            var response = JSON.parse(body)
            var fullLoc = response.current_observation.display_location.full
            var temp = response.current_observation.temp_c + "°C"
            var tajutav = " (tajutav: " + response.current_observation.feelslike_c + "°C)"
            if (response.current_observation.temp_c == response.current_observation.feelslike_c) {
                tajutav = "";
            }
            var tuulekiirus = "tuule kiirus: " + Math.round(10 * (response.current_observation.wind_kph / 60 / 60 * 1000)) / 10 + " m/s"
            if (response.current_observation.wind_kph == 0) {
                tuulekiirus = "tuulevaikne";
            }
            var kirjeldus = response.current_observation.weather
            var homme = p2evat6lk(response.forecast.simpleforecast.forecastday[1].date.weekday)
            var hommemin = response.forecast.simpleforecast.forecastday[1].low.celsius
            var hommemax = response.forecast.simpleforecast.forecastday[1].high.celsius
            var homnekirjeldus = response.forecast.simpleforecast.forecastday[1].conditions
            kirjeldus = ilmat6lk(kirjeldus)
            homnekirjeldus = homseilmat6lk(homnekirjeldus)
            callback(fullLoc + ": " + temp + tajutav + ", " + tuulekiirus + ", " + kirjeldus + 
            ". Homne (" + homme + ") temperatuur kõigub " + hommemin + " ja " + hommemax + " kraadi vahel." + homnekirjeldus)
        }
        else {
            callback("Ilmajaam on puhkusel!")
        }
    })
}

function p2evat6lk(p2ev) {
    if (p2ev === "Monday") {
        p2ev = "esmaspäevane"
    }
    if (p2ev === "Tuesday") {
        p2ev = "teisipäevane"
    }
    if (p2ev === "Wednesday") {
        p2ev = "kolmapäevane"
    }
    if (p2ev === "Thursday") {
        p2ev = "neljapäevane"
    }
    if (p2ev === "Friday") {
        p2ev = "reedene"
    }
    if (p2ev === "Saturday") {
        p2ev = "laupäevane"
    }
    if (p2ev === "Sunday") {
        p2ev = "pühapäevane"
    }
    return p2ev
}

function ilmat6lk(ilm) {
    ilm = ilm.toLowerCase()
    if (ilm.match(/^light/i)) {
        var eesliide = "kerge"
        ilm = ilm.replace(/^light/i, "").trim()
    }
    if (ilm.match(/^heavy/i)) {
        var eesliide = "tugev"
        ilm = ilm.replace(/^heavy/i, "").trim()
    }
    var dict = {
        "drizzle": "uduvihm",
        "freezing drizzle": "jäine uduvihm",
        "rain": "vihmasadu",
        "snow": "lumesadu",
        "snow gains": "lumeterade esinevus",
        "ice crystals": "jääkristallide esinevus",
        "ice pellets": "jäävihm",
        "hail": "rahe",
        "mist": "uduvine",
        "fog": "udu",
        "fog patches": "udulaikude esinevus",
        "smoke": "suits",
        "volcanic ash": "vulkaanilise tuha esinevus",
        "widespread dust": "tolm",
        "sand": "liiv",
        "haze": "somp",
        "spray": "pritsmete esinevus",
        "dust whirls": "tolmuiil",
        "sandstorm": "liivatorm",
        "low drifting snow": "pinna(lumi)",
        "low drifting widespread dust": "pinna(tolm)",
        "low drifting sand": "pinna(liiv)",
        "blowing snow": "madal(lumi)",
        "blowing widespread dust": "madal(tolm)",
        "blowing sand": "madal(liiv)",
        "rain mist": "vihmavine",
        "rain showers": "hoovihm",
        "snow showers": "hoolumi",
        "snow blowing snow mist": "",
        "ice pellet showers": "jäävihmahoog",
        "hail showers": "rahehoog",
        "small hail showers": "väike rahehoog",
        "thunderstorm": "äikesetorm",
        "thunderstorms and rain": "äikesetorm ja vihm",
        "thunderstorms and snow": "äikesetorm ja lumi",
        "thunderstorms and ice pellets": "äikesetorm ja jäävihm",
        "thunderstorms with hail": "äikesetorm ja rahe",
        "thunderstorms with small hail": "äikesetorm ja kerge rahe",
        "freezing drizzle": "jäine uduvihm",
        "freezing rain": "jäine vihm",
        "freezing fog": "jäine udu",
        "patches of fog": "udulaigud",
        "shallow fog": "pinnaudu",
        "partial fog": "osaline udu",
        "overcast": "pilvine",
        "clear": "selge",
        "partly cloudy": "vahelduv pilvisus",
        "mostly cloudy": "peamiselt pilves",
        "scattered clouds": "hõre pilvisus",
        "small hail": "väike rahe",
        "squalls": "pagid",
        "funnel cloud": "lehterpilv",
        "unknown precipitation": "tundmatu sadu",
        "unknown": "tuvastamata ilmastikutingimus",
    }
    Object.keys(dict).forEach(function (key) {
        var regex = new RegExp(ilm, 'gi');
        if (key.match(regex)) {
            ilm = ilm.replace(key, dict[key])
        }
        // console.log(key, dict[key]);
    });
    if (eesliide) {
        ilm = eesliide + " " + ilm
    }
    return ilm //.charAt(0).toUpperCase() + ilm.slice(1)
}

function homseilmat6lk(ilm) {
    ilm = ilm.toLowerCase()
    var dict = {
        "chance of flurries": " Võib sadada kerget lund või lörtsi.",
        "chance of rain": " Võib sadada vihma.",
        "chance rain": " Võib sadada vihma.",
        "chance of freezing rain": "Võib esineda jäist vihma.",
        "chance of sleet": "Võib esineda jäidet.",
        "chance of snow": " Võib sadada lund.",
        "chance of thunderstorms": "Äikesetormide võimalus.",
        "chance of a thunderstorm": "Äikese võimalus.",
        "clear": " Ilm tõotab tulla selge.",
        "cloudy": " Ilm tõotab tulla pilvine.",
        "flurries": " Sajab kerget lund või lörtsi.",
        "fog": " Ilm tuleb udune.",
        "haze": " Tuleb mõnusalt sombune ilm.",
        "mostly cloudy": " Ilm tuleb peamiselt pilvine.",
        "mostly sunny": " Ilm tuleb peamiselt päikesepaisteline.",
        "partly cloudy": " Ilm tuleb vahelduva pilvisusega.",
        "partly sunny": "Ilm tuleb enamasti päikesepaisteline.",
        "freezing rain": " Sajab jäist vihma.",
        "rain": " Ilm tuleb sajune.",
        "sleet": " Esineb jäidet.",
        "snow": " Sajab lund.",
        "sunny": " Ilm saab olema päikseline.",
        "thunderstorms": " Äikesetormid.",
        "thunderstorm": " Äikesetorm.",
        "unknown": " Ilma kohta andmed puuduvad.",
        "overcast": " Ilm tuleb pilvine.",
        "scattered clouds": " Võib kohata väheseid pilvi."
    }
    Object.keys(dict).forEach(function (key) {
        var regex = new RegExp(ilm, 'gi');
        if (key.match(regex)) {
            ilm = ilm.replace(key, dict[key])
        }
        // console.log(key, dict[key]);
    });
    return ilm //.charAt(0).toUpperCase() + ilm.slice(1)
}

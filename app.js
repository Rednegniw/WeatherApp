var https = require("https");

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': 'a403cc43-0ba1-4422-b993-4c31c7dcb3c5',
    'password': 'wuRjGx2zA0GP',
    'version_date': '2017-02-27'
});

var parameters = {
    'text': 'IBM is an American multinational technology company headquartered in United States, Moscow, New York, and Prague, with operations in over 170 countries.',
    'language': 'en',
    'features': {
        'entities': {
        }
    }
};

var citiesArray = [];
var locationsIDList = [];

natural_language_understanding.analyze(parameters, function(err, response) {
    if (err) {
        console.log('error:', err);
    } else {
        for (var i = 0, len = response.entities.length; i < len; i++) {
            if (response.entities[i].type === "Location") {
                for (var j  = 0, length = response.entities[i].disambiguation.subtype.length; j < length; j++) {
                    if (response.entities[i].disambiguation.subtype[j] === "City") {
                        citiesArray.push(response.entities[i].text);
                    }
                }
            }
        }
        console.log(citiesArray);
        getTheWeather(citiesArray);
    }
});

function weatherAPICall(url, city) {
    https.get(url, function (res, callback) {
        var body = '';

        res.on('data', function (data) {
            body += data;
        });
        // After the response is completed, parse it and log it to the console
        res.on('end', function () {
            var parsed = JSON.parse(body);
            console.log("Weather in " + city + " is " + parsed.observation.wx_phrase + ", with max temperatures up to " + parsed.observation.temp + " degrees.")
        });
    })
        .on('error', function (e) {
            console.log("Got error: " + e.message);
        });
}

function getLocationID(city) {
    https.get("https://e991c948-8998-4900-bfdf-e553523b48a9:QKv1Wq0yUE@twcservice.eu-gb.mybluemix.net:443/api/weather/v3/location/search?query=" + city + "&locationType=city&language=en-US", function (res, callback) {
        var body = '';

        res.on('data', function (data) {
            body += data;
        });
        // After the response is completed, parse it and log it to the console
        res.on('end', function () {
            var parsed = JSON.parse(body);
            var coordinates = [parsed.location.latitude[0] + "/" + parsed.location.longitude[0], parsed.location.city[0]];
            locationsIDList.push(coordinates);
        });
    })
        .on('error', function (e) {
            console.log("Got error: " + e.message);
        });
}

function getTheWeather(citiesList) {
    for (var v = 0; v < citiesList.length; v++) {
        getLocationID(citiesList[v]);
    }

    setTimeout(function () {
        for (var c = 0; c < locationsIDList.length; c++) {
            weatherAPICall("https://e991c948-8998-4900-bfdf-e553523b48a9:QKv1Wq0yUE@twcservice.eu-gb.mybluemix.net:443/api/weather/v1/geocode/" + locationsIDList[c][0] + "/observations.json?units=m&language=en-US", locationsIDList[c][1]);
        }
    }, 750);
}




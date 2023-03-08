// global variables
let openWeatherApiKey = 'fc3def5462a506203a8637a36e23cc8e';
let openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
let oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall?';
let usrForm = $('#search-cities');
let col2El = $('.col-days');
let cityIo = $('#city');
let fiveDays = $('#five-day');
let srchHstry = $('#srch-Hstry');
let currDay = moment().format('M/DD/YYYY');
let iconUrl = 'http://openweathermap.org/img/wn/';
let srchHstryArr = loadSearchHistory();
let city = "city";

// capitalizes first letter of a string
// takes a string as input;
function caseHandling(str) {
  //converted to lowercase using the toLowerCase method and split into an array of words using split method w/ a space separator
  var splitStr = str.toLowerCase().split(' ');
  // iterates through each word in the array
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    // gets 1st char of word using charAt method and converts to uppercase using toUpperCase method
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    // concatenates the uppercase 1st char with the rest of the word using substring method, then assigns the new title-cased word back to the splitStr array at current index
  }
  // directly return the joined string
  // after words have been title-cased, the join method combines the words back into a string with a space separator
  return splitStr.join(' ');
}

// loads cities from local storage and recreate history buttons
// attempts to retrieve the search history data from browser's localStorage using getItem method - stored under the key search history
function loadSearchHistory() {
  // gets data from localStorage using key 'search history'
  var srchHstryArr = JSON.parse(localStorage.getItem('search history'));
  // if no data, function creates a new object 'srchHstryArr' and has property 'searchedCity', which is an empty array
  if (!srchHstryArr) {
    srchHstryArr = {
      searchedCity: [],
    };
  } else {
    // adds search history buttons
    for (var i = 0; i < srchHstryArr.searchedCity.length; i++) {
      searchHistory(srchHstryArr.searchedCity[i]);
    }
  }
  // updates the search history data stored in localStorage
  return srchHstryArr;
}

// saves to local storage
function saveSearchHistory() {
  localStorage.setItem('search history', JSON.stringify(srchHstryArr));
};

// creates history city buttons
function searchHistory(city) {
  var searchHistoryBtn = $('<button>')
    .addClass('btn')
    .text(city)
    .on('click', function() {
      $('#current-weather').remove();
      $('#five-day').empty();
      $('#forecast-header').remove();
      getWeather(city);
    })
    .attr({
      type: 'button'
    });

  // appends button to search history container
  srchHstry.append(searchHistoryBtn);
}

// weather data from API URL
function getWeather(city) {
  // apiUrl for coordinates
  var apiCoordinatesUrl = `${openWeatherCoordinatesUrl}${city}&appid=${openWeatherApiKey}`;
  // fetches the city lat/lon
  fetch(apiCoordinatesUrl)
    .then(function(coordinateResponse) {
      if (coordinateResponse.ok) {
        coordinateResponse.json().then(function(data) {
          var cityLatitude = data.coord.lat;
          var cityLongitude = data.coord.lon;
          // fetches weather info
          var apiOneCallUrl = `${oneCallUrl}lat=${cityLatitude}&lon=${cityLongitude}&exclude=minutely,hourly&units=imperial&appid=${openWeatherApiKey}`;

          fetch(apiOneCallUrl)
            .then(function(weatherResponse) {
              if (weatherResponse.ok) {
                weatherResponse.json().then(function(weatherData) {

                  // starts current day @ display

                  // adds div to hold current day info
                  var currentWeatherEl = $('<div>')
                    .attr({
                      id: 'current-weather'
                    });

                  // weather icon from city
                  var weatherIcon = weatherData.current.weather[0].icon; // weather icon
                  var cityCurrentWeatherIcon = `${iconUrl}${weatherIcon}.png`; //weather icon url

                  // creates h2 to display city, current day, & current weather icon
                  var currentWeatherHead = $('<h2>')
                    .text(city + ' (' + currDay + ')');
                  // creates img to display icon
                  var iconImgEl = $('<img>')
                    .attr({
                      id: 'current-weather-icon',
                      src: cityCurrentWeatherIcon,
                      alt: 'Weather Icon'
                    });
                  // creates current weather info as list
                  var currWeatherListEl = $('<ul>');

                  var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi];

                  for (var i = 0; i < currWeatherDetails.length; i++) {
                    // creates an single list items, appends to ul

                    // assigns bg color to UVI using conditionals
                    if (currWeatherDetails[i] === 'UV Index: ' + weatherData.current.uvi) {

                      var currWeatherListItem = $('<li>')
                        .text('UV Index: ');

                      currWeatherListEl.append(currWeatherListItem);

                      var uviItem = $('<span>')
                        .text(weatherData.current.uvi);

                      if (uviItem.text() <= 2) {
                        uviItem.addClass('green');
                      } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                        uviItem.addClass('yellow');
                      } else {
                        uviItem.addClass('red');
                      }

                      currWeatherListItem.append(uviItem);

                      // creates every list item that isn't UVI
                    } else {
                      var currWeatherListItem = $('<li>')
                        .text(currWeatherDetails[i]);
                      // appends to ul
                      currWeatherListEl.append(currWeatherListItem);
                    }

                  }

                  // appends current weather div to col2 before #five-day
                  $('#five-day').before(currentWeatherEl);
                  // appends current weather heading to current weather div
                  currentWeatherEl.append(currentWeatherHead);
                  // appends icon to current weather header
                  currentWeatherHead.append(iconImgEl); // header icon
                  // appends ul to current weather
                  currentWeatherEl.append(currWeatherListEl);

                  // 5-day forecast //

                  // creates h2 header for 5-day forecast
                  var fiveDayHeaderEl = $('<h2>')
                    .text('5-Day Forecast:')
                    .attr({
                      id: 'forecast-header'
                    });

                  // appends 5 day forecast header to col2 after current weather div
                  $('#current-weather').after(fiveDayHeaderEl);

                  // creates array for the dates for the next 5 days

                  var fiveDayArray = [];

                  for (var i = 0; i < 5; i++) {
                    let forecastDate = moment().add(i + 1, 'days').format('M/DD/YYYY');

                    fiveDayArray.push(forecastDate);
                  }

                  // for each date in the array - creates a card displaying temp, wind & humid
                  for (var i = 0; i < fiveDayArray.length; i++) {
                    // creates a div container for each card
                    var cardDivEl = $('<div>')
                      .addClass('col-fiveday');

                    // creates div container for the card body
                    var cardBodyDivEl = $('<div>')
                      .addClass('card-body');

                    // creates the card-title
                    var cardTitleEl = $('<h3>')
                      .addClass('card-title')
                      .text(fiveDayArray[i]);

                    // creates icon for current day weather
                    var forecastIcon = weatherData.daily[i].weather[0].icon;

                    var forecastIconEl = $('<img>') // img el / icon for cards
                      .attr({
                        src: `${iconUrl}${forecastIcon}.png`,
                        alt: 'Weather Icon',
                        style: 'margin: 8%; background-color: #7190DD; border-radius: 25%',
                      });

                    // creates card text displaying weather details
                    var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi];
                    // creates temp
                    var tempEL = $('<p>')
                      .addClass('card-text')
                      .text('Temp: ' + weatherData.daily[i].temp.max);
                    // creates wind
                    var windEL = $('<p>')
                      .addClass('card-text')
                      .text('Wind: ' + weatherData.daily[i].wind_speed + ' MPH');
                    // creates humidity
                    var humidityEL = $('<p>')
                      .addClass('card-text')
                      .text('Humidity: ' + weatherData.daily[i].humidity + '%');

                    //append cardDivEl to the #five-day container
                    fiveDays.append(cardDivEl);
                    //append cardBodyDivEL to cardDivEl
                    cardDivEl.append(cardBodyDivEl);
                    //append card title to card body
                    // card title
                    cardBodyDivEl.append(cardTitleEl);
                    //append icon to card body
                    // icon card body
                    cardBodyDivEl.append(forecastIconEl);
                    //append temp details to card body
                    // temp details
                    cardBodyDivEl.append(tempEL);
                    //append wind details to card body
                    // wind details
                    cardBodyDivEl.append(windEL);
                    //append humidity details to card body
                    // humid details
                    cardBodyDivEl.append(humidityEL);
                  }

                });
              }
            });
        });
        // if fetch goes through but Open Weather can't find details for city
      } else {
        alert('Error: Open Weather could not find city');
      }
    })
    // if fetch fails
    .catch(function(error) {
      alert('Unable to connect to Open Weather');
    });
}

// sets location to atlanta
getWeather("Atlanta");

//function to push button elements below and search for city
function submitCitySearch(event) {
  event.preventDefault();

  //get value from user input
  var city = caseHandling(cityIo.val().trim());

  //prevent them from searching for cities stored in local storage
  if (srchHstryArr.searchedCity.includes(city)) {
    alert(`${city} is included in history below. Click the ${city} button to get weather.`);
    cityIo.val('');
  } else if (city) {
    getWeather(city);
    searchHistory(city);
    srchHstryArr.searchedCity.push(city);
    saveSearchHistory();
    //empty the form text area
    cityIo.val('');

    //if user doesn't type in a city
  } else {
    alert('Please enter a city!');
  }
}

// on submission of user data gets user input for city & fetch API data
usrForm.on('submit', submitCitySearch);

// on click of search button - empties the current weather & 5-day forecast info
$('#search-btn').on('click', () => {
  $('#current-weather').remove();
  $('#five-day').empty();
  $('#forecast-header').remove();
});

// clears localStorage and refreshes page
function clear() {
  // clears localStorage
  localStorage.clear();
  // reloads page
  location.reload();
}
// querySelector to clear localStorage on click for the 'clear' btn
$("#clear").on("click", clear);

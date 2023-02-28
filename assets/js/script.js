// global variables
let openWeatherApiKey = 'cb1629cc1b83bc1615c9520d38ff0e31';
let openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
let oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=';
let userFormEL = $('#city-search');
let col2El = $('.col2');
let cityInputEl = $('#city');
let fiveDayEl = $('#five-day');
let searchHistoryEl = $('#search-history');
let currentDay = moment().format('M/DD/YYYY');
let weatherIconUrl = 'http://openweathermap.org/img/wn/';
let searchHistoryArray = loadSearchHistory();

// capitalizes first letter of a string
function titleCase(str) { // takes a string as input
  var splitStr = str.toLowerCase().split(' '); //converted to lowercase using the toLowerCase method and split into an array of words using split method w/ a space separator
  for (var i = 0; i < splitStr.length; i++) { // iterates through each word in the array
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1); // gets 1st char of word using charAt method and converts to uppercase using toUpperCase method
  } // concatenates the uppercase 1st char with the rest of the word using substring method, then assigns the new title-cased word back to the splitStr array at current index
  // Directly return the joined string
  return splitStr.join(' '); // after words have been title-cased, the join method combines the words back into a string with a space separator
}

// loads cities from local storage and recreate history buttons
function loadSearchHistory() { // attempts to retrieve the search history data from browser's localStorage using getItem method - stored uner the key search history
  var searchHistoryArray = JSON.parse(localStorage.getItem('search history'));

  // if nothing in localStorage, creates a new object to track user's history
  if (!searchHistoryArray) {
    searchHistoryArray = {
      searchedCity: [],
    };
  } else {
    // adds search history btns
    for (var i = 0; i < searchHistoryArray.searchedCity.length; i++) {
      searchHistory(searchHistoryArray.searchedCity[i]);
    }
  }

  return searchHistoryArray;
}

// saves to local storage
function saveSearchHistory() {
  localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

// creates history city buttons
function searchHistory(city) {
  var searchHistoryBtn = $('<button>')
    .addClass('btn')
    .text(city)
    .on('click', function() {
      $('#current-weather').remove();
      $('#five-day').empty();
      $('#five-day-header').remove();
      getWeather(city);
    })
    .attr({
      type: 'button'
    });

  // appends button to search history container
  searchHistoryEl.append(searchHistoryBtn);
}

// weather data from API URL
function getWeather(city) {
  // apiUrl for coordinates
  var apiCoordinatesUrl = openWeatherCoordinatesUrl + city + '&appid=' + openWeatherApiKey;
  // fetches the city lat/lon
  fetch(apiCoordinatesUrl)
    .then(function(coordinateResponse) {
      if (coordinateResponse.ok) {
        coordinateResponse.json().then(function(data) {
          var cityLatitude = data.coord.lat;
          var cityLongitude = data.coord.lon;
          // fetches weather info
          var apiOneCallUrl = `${oneCallUrl}${cityLatitude}&lon=${cityLongitude}&appid=${openWeatherApiKey}&units=imperial`;

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
                  var weatherIcon = weatherData.current.weather[0].icon;
                  var cityCurrentWeatherIcon = `${weatherIconUrl}${weatherIcon}.png`;

                  // creates h2 to display city, current day, & current weather icon
                  var currentWeatherHeadingEl = $('<h2>')
                    .text(city + ' (' + currentDay + ')');
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
                        uviItem.addClass('favorable');
                      } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                        uviItem.addClass('moderate');
                      } else {
                        uviItem.addClass('severe');
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
                  currentWeatherEl.append(currentWeatherHeadingEl);
                  // appends icon to current weather header
                  currentWeatherHeadingEl.append(iconImgEl);
                  // appends ul to current weather
                  currentWeatherEl.append(currWeatherListEl);

                  // 5-day forecast //

                  // creates h2 header for 5-day forecast
                  var fiveDayHeaderEl = $('<h2>')
                    .text('5-Day Forecast:')
                    .attr({
                      id: 'five-day-header'
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
                      .addClass('col3');

                    // creates div container for the card body
                    var cardBodyDivEl = $('<div>')
                      .addClass('card-body');

                    // creates the card-title
                    var cardTitleEl = $('<h3>')
                      .addClass('card-title')
                      .text(fiveDayArray[i]);

                    // creates icon for current day weather
                    var forecastIcon = weatherData.daily[i].weather[0].icon;

                    var forecastIconEl = $('<img>')
                      .attr({
                        src: weatherIconUrl + forecastIcon + '.png',
                        alt: 'Weather Icon'
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
                    fiveDayEl.append(cardDivEl);
                    //append cardBodyDivEL to cardDivEl
                    cardDivEl.append(cardBodyDivEl);
                    //append card title to card body
                    cardBodyDivEl.append(cardTitleEl);
                    //append icon to card body
                    cardBodyDivEl.append(forecastIconEl);
                    //append temp details to card body
                    cardBodyDivEl.append(tempEL);
                    //append wind details to card body
                    cardBodyDivEl.append(windEL);
                    //append humidity details to card body
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

//function to push button elements to 

function submitCitySearch(event) {
  event.preventDefault();

  //get value from user input
  var city = titleCase(cityInputEl.val().trim());

  //prevent them from searching for cities stored in local storage
  if (searchHistoryArray.searchedCity.includes(city)) {
    alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
    cityInputEl.val('');
  } else if (city) {
    getWeather(city);
    searchHistory(city);
    searchHistoryArray.searchedCity.push(city);
    saveSearchHistory();
    //empty the form text area
    cityInputEl.val('');

    //if user doesn't type in a city
  } else {
    alert('Please enter a city');
  }
}

// on submission of user data gets user input for city & fetch API data
userFormEL.on('submit', submitCitySearch);

// on click of search button - empties the current weather & 5-day forecast info
$('#search-btn').on('click', () => {
  $('#current-weather').remove();
  $('#five-day').empty();
  $('#five-day-header').remove();
});
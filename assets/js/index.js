// const variables
const apiKey = 'fc3def5462a506203a8637a36e23cc8e';
const coordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
const oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall?';
const iconUrl = 'http://openweathermap.org/img/wn/';

// DOM elements
const usrForm = $('#search-cities');
const col2El = $('.col-days');
const cityIo = $('#city');
const fiveDays = $('#five-day');
const srchHstry = $('#srch-Hstry');

// variables
let srchHstryArr = loadSearchHistory();
const currDay = moment().format('M/DD/YYYY');
let city = "city";

// uses the replace method with regex to capitalize first letter of each word
function caseHandling(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// event listener for search form
function loadSearchHistory() {
  // gets data from localStorage using key 'search history'
  var srchHstryArr = JSON.parse(localStorage.getItem('search history')) || { searchedCity: [] };
  // adds search history buttons
  srchHstryArr.searchedCity.forEach(searchHistory);
  // updates the search history data stored in localStorage
  return srchHstryArr;
}

// saves to local storage
const saveSearchHistory = () => {
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

// fetches weather data from API URL
function getWeather(city) {
  // apiUrl for coordinates
  var apiCoordinatesUrl = `${coordinatesUrl}${city}&appid=${apiKey}`;
  // fetches the city lat/lon
  fetch(apiCoordinatesUrl)
    // checks if response is ok
    .then(function(coordinateResponse) {
      // if response is ok
      if (coordinateResponse.ok) {
        // parses response to JSON
        coordinateResponse.json().then(function(data) {
          // gets city latitude
          var cityLatitude = data.coord.lat;
          // gets city longitude
          var cityLongitude = data.coord.lon;
          // fetches weather info
          var apiOneCallUrl = `${oneCallUrl}lat=${cityLatitude}&lon=${cityLongitude}&exclude=minutely,hourly&units=imperial&appid=${apiKey}`;

          // fetches weather info
          fetch(apiOneCallUrl)
            // checks if response is ok
            .then(function(weatherResponse) {
              // if response is ok
              if (weatherResponse.ok) {
                // parses response to JSON
                weatherResponse.json().then(function(weatherData) {
                  // starts current day @ display
                  // adds div to hold current day info
                  var currentWeatherEl = $('<div>')
                    // adds id to div
                    .attr({
                      id: 'current-weather'
                    });

                  // weather icon from city
                  // weather icon
                  var weatherIcon = weatherData.current.weather[ 0 ].icon;
                  //weather icon url
                  var cityCurrentWeatherIcon = `${iconUrl}${weatherIcon}.png`;

                  // creates h2 to display city, current day, & current weather icon
                  var currentWeatherHead = $('<h2>')
                    // adds city name to header
                    .text(city + ' (' + currDay + ')');
                  // creates img to display icon
                  var iconImgEl = $('<img>')
                    // adds icon to img
                    .attr({
                      // adds id to img
                      id: 'current-weather-icon',
                      // adds src to img
                      src: cityCurrentWeatherIcon,
                      // adds alt to img
                      alt: 'Weather Icon'
                    });
                  // creates current weather info as list
                  var currentWeatherListElement = $('<ul>');

                  // array to hold current weather info
                  var currentWeatherInfo = [ 'Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi ];

                  // for each item in currentWeatherInfo array - creates a list item
                  currentWeatherInfo.forEach(function(info) {
                    // creates list item
                    var currWeatherListItem;
                    // if statement to add class to UV index
                    if (info === 'UV Index: ' + weatherData.current.uvi) {
                      // creates list item
                      currWeatherListItem = $('<li>').text('UV Index: ');
                      // appends list item to ul
                      currentWeatherListElement.append(currWeatherListItem);
                      // creates span to hold UV index
                      var uviItem = $('<span>').text(weatherData.current.uvi);
                      // adds class to UV index
                      var uviClass = uviItem.text() <= 2 ? 'green' : uviItem.text() <= 7 ? 'orange' : 'red';
                      // adds class to UV index
                      uviItem.addClass(uviClass);
                      // appends UV index to list item
                      currWeatherListItem.append(uviItem);
                      // appends list item to ul
                    } else {
                      // creates list item
                      currWeatherListItem = $('<li>').text(info);
                      // appends list item to ul
                      currentWeatherListElement.append(currWeatherListItem);
                    }
                  });

                  // appends current weather div to col2 before #five-day
                  $('#five-day').before(currentWeatherEl);
                  // appends current weather heading to current weather div
                  currentWeatherEl.append(currentWeatherHead);
                  // appends icon to current weather header
                  currentWeatherHead.append(iconImgEl); // header icon
                  // appends ul to current weather
                  currentWeatherEl.append(currentWeatherListElement);

                  // 5-day forecast //

                  // creates h2 header for 5-day forecast
                  var fiveDayHeaderEl = $('<h2>')
                    .text('5-Day Forecast:')
                    .attr({
                      id: 'forecast-header'
                    });

                  // appends 5 day forecast header to col2 after current weather div
                  $('#current-weather').after(fiveDayHeaderEl);

                  // array to hold the next 5 days
                  var fiveDayArray = [];

                  // for loop to push the next 5 days into the array
                  for (var i = 0; i < 5; i++) {
                    // gets the next 5 days
                    let forecastDate = moment().add(i + 1, 'days').format('M/DD/YYYY');
                    // pushes the next 5 days into the array
                    fiveDayArray.push(forecastDate);
                  }

                  // for each date in the array - creates a card displaying temp, wind & humid
                  for (var i = 0; i < fiveDayArray.length; i++) {
                    // creates a div container for each card
                    var cardDivEl = $('<div>')
                      // adds class to div
                      .addClass('col-fiveday');

                    // creates div container for the card body
                    var cardBodyDivEl = $('<div>')
                      // adds class to div
                      .addClass('card-body');

                    // creates the card-title
                    var cardTitleEl = $('<h3>')
                      // adds class to h3
                      .addClass('card-title')
                      // adds text to h3
                      .text(fiveDayArray[ i ]);

                    // creates icon for current day weather
                    var forecastIcon = weatherData.daily[ i ].weather[ 0 ].icon;

                    // creates img el / icon for cards
                    var forecastIconEl = $('<img>') // img el / icon for cards
                      // adds class to img
                      .attr({
                        // adds src to img
                        src: `${iconUrl}${forecastIcon}.png`,
                        // adds alt to img
                        alt: 'Weather Icon',
                        // adds style to img
                        style: 'margin: 8%; background-color: #7190DD; border-radius: 25%',
                      });

                    // creates card text displaying weather details
                    var currentWeatherInfo = [ 'Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi ];
                    // creates temp
                    var tempEL = $('<p>')
                      // adds class to p
                      .addClass('card-text')
                      // adds text to p
                      .text('Temp: ' + weatherData.daily[ i ].temp.max);
                    // creates wind
                    var windEL = $('<p>')
                      // adds class to p
                      .addClass('card-text')
                      // adds text to p
                      .text('Wind: ' + weatherData.daily[ i ].wind_speed + ' MPH');
                    // creates humidity
                    var humidityEL = $('<p>')
                      // adds class to p
                      .addClass('card-text')
                      // adds text to p
                      .text('Humidity: ' + weatherData.daily[ i ].humidity + '%');

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

// sets location to nashville
getWeather("Nashville");

//function to push button elements below and search for city
function submitCitySearch(event) {
  event.preventDefault();

  //get value from user input
  var city = caseHandling(cityIo.val().trim());

  //prevent them from searching for cities stored in local storage
  if (srchHstryArr.searchedCity.includes(city)) {
    // get weather for city
    alert(`${city} is included in history below. Click the ${city} button to get weather.`);
    // empty the form text area
    cityIo.val('');
    // if user types in a city
  } else if (city) {
    // get weather for city
    getWeather(city);
    // add city to search history
    searchHistory(city);
    // push city to searchedCity array
    srchHstryArr.searchedCity.push(city);
    // save search history to local storage
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
  // removes current weather info
  $('#current-weather').remove();
  // removes 5-day forecast info
  $('#five-day').empty();
  // removes 5-day forecast header
  $('#forecast-header').remove();
});

// Define the clear function
function clearLocalStorage() {
  // Prompt user to confirm action
  const confirmClear = confirm(`Are you sure you want to clear the local storage?`);
  // If the user confirms the action, clear local storage and reload the page
  if (confirmClear) {
    // Clear local storage
    localStorage.clear();
    // Reload the page
    window.location.reload();
  }
}

// Add a click event listener to the clear button
$('#clear').on('click', clearLocalStorage);

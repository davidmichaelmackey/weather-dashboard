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
    .then(function(coordinateResponse) {
      if (coordinateResponse.ok) {
        coordinateResponse.json().then(function(data) {
          var cityLatitude = data.coord.lat;
          var cityLongitude = data.coord.lon;
          // fetches weather info
          var apiOneCallUrl = `${oneCallUrl}lat=${cityLatitude}&lon=${cityLongitude}&exclude=minutely,hourly&units=imperial&appid=${apiKey}`;

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
                  // weather icon
                  var weatherIcon = weatherData.current.weather[ 0 ].icon;
                  //weather icon url
                  var cityCurrentWeatherIcon = `${iconUrl}${weatherIcon}.png`;

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
                  var currentWeatherListElement = $('<ul>');

                  var currentWeatherInfo = [ 'Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi ];

                  currentWeatherInfo.forEach(function(info) {
                    var currWeatherListItem;
                    if (info === 'UV Index: ' + weatherData.current.uvi) {
                      currWeatherListItem = $('<li>').text('UV Index: ');
                      currentWeatherListElement.append(currWeatherListItem);
                      var uviItem = $('<span>').text(weatherData.current.uvi);
                      var uviClass = uviItem.text() <= 2 ? 'green' : uviItem.text() <= 7 ? 'orange' : 'red';
                      uviItem.addClass(uviClass);
                      currWeatherListItem.append(uviItem);
                    } else {
                      currWeatherListItem = $('<li>').text(info);
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
                      .text(fiveDayArray[ i ]);

                    // creates icon for current day weather
                    var forecastIcon = weatherData.daily[ i ].weather[ 0 ].icon;

                    var forecastIconEl = $('<img>') // img el / icon for cards
                      .attr({
                        src: `${iconUrl}${forecastIcon}.png`,
                        alt: 'Weather Icon',
                        style: 'margin: 8%; background-color: #7190DD; border-radius: 25%',
                      });

                    // creates card text displaying weather details
                    var currentWeatherInfo = [ 'Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi ];
                    // creates temp
                    var tempEL = $('<p>')
                      .addClass('card-text')
                      .text('Temp: ' + weatherData.daily[ i ].temp.max);
                    // creates wind
                    var windEL = $('<p>')
                      .addClass('card-text')
                      .text('Wind: ' + weatherData.daily[ i ].wind_speed + ' MPH');
                    // creates humidity
                    var humidityEL = $('<p>')
                      .addClass('card-text')
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

// Define the clear function
function clearLocalStorage() {
  // Prompt user to confirm action
  const confirmClear = confirm(`Are you sure you want to clear the local storage?`);
  // If the user confirms the action, clear local storage and reload the page
  if (confirmClear) {
    localStorage.clear();
    window.location.reload();
  }
}

// Add a click event listener to the clear button
$('#clear').on('click', clearLocalStorage);

// const variables
const openWeatherApiKey = 'fc3def5462a506203a8637a36e23cc8e',
  openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=',
  oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall?',
  iconUrl = 'http://openweathermap.org/img/wn/';

// DOM elements
const usrForm = $('#search-cities'),
  col2El = $('.col-days'),
  cityIo = $('#city'),
  fiveDays = $('#five-day'),
  srchHstry = $('#srch-Hstry');

// variables
let srchHstryArr = loadSearchHistory();
const currDay = moment().format('M/DD/YYYY');
let city = "city";

// uses the replace method with regex to capitalize first letter of each word
function caseHandling(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
const saveSearchHistory = () => localStorage.setItem('search history', JSON.stringify(srchHstryArr));

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

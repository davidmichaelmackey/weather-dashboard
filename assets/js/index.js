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

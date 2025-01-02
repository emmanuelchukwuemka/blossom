const currentDate = ()=>{
// Get the current timestamp using Date.now()
const timestamp = Date.now();

// Create a new Date object using the timestamp
const date = new Date(timestamp);

// Define the date format options using the Intl.DateTimeFormat API
const options = {
  year: 'numeric',
  month: 'short', // You can use 'short', 'long', or 'numeric' for the month
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short', // This will include the time zone abbreviation
};

// Format the date using Intl.DateTimeFormat
const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
return(formattedDate)
}

module.exports = currentDate

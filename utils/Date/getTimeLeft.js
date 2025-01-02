
const  getTimeLeft =(date)=> {

    const result = date.split(" ")
    let month = '01'
    let year =  result[3]
    let day = result[2]
    let time = result[4]
  
  if(result[1]==="Jan"){
     month =  '01';
  }else  if(result[1]==="Feb"){
     month =  '02'
  }else  if(result[1]==="Mar"){
     month =  '03'
  }else  if(result[1]==="Apr"){
     month =  '04'
  }else  if(result[1]==="May"){
     month = '05'
  } else  if(result[1]==="Jun"){
     month =  '06'
  }else  if(result[1]==="July"){
     month =  '07'
  }else  if(result[1]==="Aug"){
    month =  '08'
  }else  if(result[1]==="Sep"){
  month = '09'
  }else  if(result[1]==="Oct"){
  month =  '10'
  }else  if(result[1]==="Nov"){
  month =  '11'
  }else  if(result[1]==="Dec"){
  month =  '12'
  }  
  
  
  let fromDate =  new Date(`${year}-${month}-${day}T${time}`);
  let toDate = new Date()
    // Get the difference in milliseconds
    const timeDifference = fromDate.getTime() - toDate.getTime();
  
    // If the time difference is negative, the given date is in the past
    if (timeDifference <= 0) {
      return "Event Expired!!!";
    }
  
    // Calculate the days, hours, minutes, and seconds
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
    return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
  }
  
  
    module.exports = getTimeLeft
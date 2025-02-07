import https from 'https';

const time = 14 * 60 * 1000; // 14 minutes
let totalNoOfTimePinged = 0;
let timer;

export const wakeUpTheServer = () => {
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    https
      .get('https://ecommerce-server-1cz2.onrender.com/api/pinged', (res) => {
        totalNoOfTimePinged += 1;
        console.log(
          `Pinged server ${totalNoOfTimePinged}, status code: ${res.statusCode}`
        );
      })
      .on('error', (err) => {
        console.error('Error pinging server:', err.message);
      });
  }, time); // ping every 14 minutes
};

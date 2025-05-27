const TOKEN_SIZE = 100;
const time = 1000 * 60;

let token = TOKEN_SIZE;
let timeInterval = new Date().getTime() + time;

export const tokenBucket = (req, res, next) => {
  // console.log('tokenBucket: ', token);
  const currentTime = new Date().getTime();

  // if token is present and timeInterval is greater than currentTime
  if (token > 0 && timeInterval > currentTime) {
    token -= 1;
    next();

    // if time is over than, refilled token and update time
  } else if (currentTime > timeInterval) {
    token = TOKEN_SIZE;
    timeInterval = currentTime + time;
    tokenBucket(req, res, next);

    // if all token have used then throw error
  } else {
    return res.status(420).json({ error: "Service not available" });
  }
};

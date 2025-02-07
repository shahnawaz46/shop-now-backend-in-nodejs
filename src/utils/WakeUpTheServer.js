const time = 1000 * 60 * 5; // 5 minutes

export const wakeUpTheServer = () => {
  let timer;
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    console.log('I am awake');
  }, time);
};

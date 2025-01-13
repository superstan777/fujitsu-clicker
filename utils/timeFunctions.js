const getRandomTime = () => {
  const startMinutes = 8 * 60 + 42; // 8:42 in minutes

  const endMinutes = 8 * 60 + 54; // 8:54 in minutes

  const randomMinutes =
    Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;

  const hours = Math.floor(randomMinutes / 60);
  const minutes = randomMinutes % 60;

  const seconds = Math.floor(Math.random() * 60);

  return { hours, minutes, seconds };
};

const getRandomTimeOffset = () => {
  const eightHours = 8 * 60 * 60 * 1000;
  const randomMinutes = Math.floor(Math.random() * 3 + 1) * 60 * 1000;
  const randomSeconds = Math.floor(Math.random() * 60) * 1000;
  const randomMilliseconds = Math.floor(Math.random() * 1000);

  const totalOffset =
    eightHours + randomMinutes + randomSeconds + randomMilliseconds;

  return totalOffset;
};

module.exports = { getRandomTime, getRandomTimeOffset };

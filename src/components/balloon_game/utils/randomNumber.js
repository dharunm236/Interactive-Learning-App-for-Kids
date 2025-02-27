const getRandomNumber = (min, max) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  // Scale to desired range
  return Math.floor((array[0] / (0xFFFFFFFF + 1)) * (max - min + 1)) + min;
};

export default getRandomNumber;

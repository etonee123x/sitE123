module.exports = {
  links: [
    'https://youtube.com',
  ],
  method: async() => {
    const data = {};
    data.title = document.title;
    return data;
  },
};

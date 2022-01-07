module.exports = async() => {
  const data = {};
  const searchResults = document.querySelector('#search-result').children;
  data.searchResults = [];
  let i = 1;
  while (data.searchResults.length < searchResults.length && data.searchResults.length < 5) {
    i++;
    if (searchResults[i].tagName === 'LI' && !searchResults[i].getAttributeNames().includes('data-fast-name')) {
      let link = searchResults[i].querySelector('div > h2 > a');
      if (link) {
        link = link.getAttribute('href');
        data.searchResults.push(link);
      }
    }
  }
  return data;
};

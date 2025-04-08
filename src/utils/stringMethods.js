// Parsed text
function parseString(string) {
    let parsedString = string.toLowerCase();
    parsedString = parsedString.replace(/\s+/g, '-');
    parsedString = parsedString.replace(/\./g, '');
    parsedString = parsedString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return parsedString;
  }
  module.exports = {
    parseString,
  };
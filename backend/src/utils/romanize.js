const marathiToRomanMap = {
  अ: 'a',
  आ: 'aa',
  इ: 'i',
  ई: 'ii',
  उ: 'u',
  ऊ: 'uu',
  ए: 'e',
  ऐ: 'ai',
  ओ: 'o',
  औ: 'au',
  क: 'k',
  ख: 'kh',
  ग: 'g',
  घ: 'gh',
  ङ: 'ng',
  च: 'ch',
  छ: 'chh',
  ज: 'j',
  झ: 'jh',
  ञ: 'ny',
  ट: 't',
  ठ: 'th',
  ड: 'd',
  ढ: 'dh',
  ण: 'n',
  त: 't',
  थ: 'th',
  द: 'd',
  ध: 'dh',
  न: 'n',
  प: 'p',
  फ: 'ph',
  ब: 'b',
  भ: 'bh',
  म: 'm',
  य: 'y',
  र: 'r',
  ल: 'l',
  व: 'v',
  श: 'sh',
  ष: 'sh',
  स: 's',
  ह: 'h',
  क्ष: 'ksh',
  त्र: 'tr',
  ज्ञ: 'gy',
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

function romanizeMarathi(marathiText) {
  if (!marathiText) return '';

  let result = '';
  let i = 0;

  while (i < marathiText.length) {
    let matched = false;

    for (let len = 3; len >= 1; len--) {
      const substring = marathiText.substring(i, i + len);
      if (marathiToRomanMap[substring]) {
        result += marathiToRomanMap[substring];
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      i++;
    }
  }

  result = result
    .replace(/a+/g, (m) => (m.length > 2 ? 'a' : m))
    .trim();

  return result;
}

module.exports = { romanizeMarathi };

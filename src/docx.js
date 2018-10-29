/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
const yauzl = require('yauzl');

const getTextFromZipFile = (zipfile, entry) =>
  new Promise(function(resolve, reject) {
    return zipfile.openReadStream(entry, function(err, readStream) {
      if (err) {
        return reject(err);
      }

      let text = '';
      let error = '';

      readStream.on('data', chunk => (text += chunk));

      readStream.on('end', function() {
        if (error.length > 0) {
          return reject(error);
        }
        return resolve(text);
      });

      return readStream.on('error', err => (error += err));
    });
  });

const calculateExtractedText = function(inText) {
  const doc = new Dom().parseFromString(inText);
  const ps = xpath.select("//*[local-name()='p']", doc);
  let text = '';

  ps.forEach(function(paragraph) {
    let localText = '';

    const parent = paragraph.parentNode;
    if (parent.localName === 'tc') {
      // eslint-disable-next-line no-console
      console.log(parent.parentNode.localName);
    }

    paragraph = new Dom().parseFromString(paragraph.toString());

    const ts = xpath.select(
      "//*[local-name()='t' or local-name()='tab' or local-name()='br' or local-name()='instrText']",
      paragraph
    );
    ts.forEach(function(t) {
      if (t.localName === 't' && t.childNodes.length > 0) {
        return (localText += t.childNodes[0].data);
      } else if (t.localName === 'tab' || t.localName === 'br') {
        return (localText += ' ');
      } else if (t.localName === 'instrText') {
        return (localText += t.childNodes[0].data);
      }
    });

    return (text += localText + '\n');
  });

  return text;
};

class DOCXExtractor {
  constructor() {}

  extract(doc) {
    return new Promise(function(resolve, reject) {
      return yauzl.open(doc, function(err, zipfile) {
        let processedEntries = 0;
        let result = '';

        if (err) {
          return reject(err);
        }

        const processEnd = function() {
          if (zipfile.entryCount === ++processedEntries) {
            if (result.length) {
              return resolve(result);
            } else {
              return reject(
                new Error('Extraction could not find content in file')
              );
            }
          }
        };

        zipfile.on('entry', function(entry) {
          if (
            /\.xml$/.test(entry.fileName) &&
            !/^(word\/media\/|word\/_rels\/)/.test(entry.fileName)
          ) {
            return getTextFromZipFile(zipfile, entry).then(function(data) {
              const text = calculateExtractedText(data);
              result += text + '\n';
              return processEnd();
            });
          } else {
            return processEnd();
          }
        });

        return zipfile.on('error', err => reject(err));
      });
    });
  }
}

module.exports = DOCXExtractor;

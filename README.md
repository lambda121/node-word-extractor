### Forked from morungos/node-word-extractor

**What's different?**  
[I needed buffer support](https://github.com/morungos/node-word-extractor/issues/11)
but didn't want to deal with coffeescript so I modified the repo a bit. The
main public change is the module is now an object with two methods `fromFile`
and `fromBuffer`. I also removed 'bluebird' so the returned promises
are native.

### word-extractor

Read data from a Word document using node.js

#### Why use this module?

There are a fair number of npm components which can extract text from Word .doc
files, but they all appear to require some external helper program, and involve
either spawning a process or communicating with a persistent one. That raises
the installation and deployment burden as well as the runtime one.

This module is intended to provide a much faster way of reading the text from a
Word file, without leaving the node.js environment.

#### How do I install this module?

```bash=
yarn add @gmr-fms/word-extractor

# Or using npm...
npm install @gmr-fms/word-extractor
```

#### How do I use this module?

```
const extract = require('word-extractor');
extract.fromFile('file.doc').then(doc => {
  console.log(doc.getBody());
});
```

The object returned from the `extract()` method is a promise that resolves to a
document object, which then provides several views onto different parts of the
document contents.

#### Methods

`extract#fromFile(filePath) => Promise<Document>`  
`extract#fromBuffer(buf) => Promise<Document>`

`Document#getBody()`

Retrieves the content text from a Word document. This will handle UNICODE
characters correctly, so if there are accented or non-Latin-1 characters present
in the document, they'll show as is in the returned string.

`Document#getFootnotes()`

Retrieves the footnote text from a Word document. This will handle UNICODE
characters correctly, so if there are accented or non-Latin-1 characters present
in the document, they'll show as is in the returned string.

`Document#getHeaders()`

Retrieves the header and footer text from a Word document. This will handle
UNICODE characters correctly, so if there are accented or non-Latin-1 characters
present in the document, they'll show as is in the returned string.

`Document#getAnnotations()`

Retrieves the comment bubble text from a Word document. This will handle UNICODE
characters correctly, so if there are accented or non-Latin-1 characters present
in the document, they'll show as is in the returned string.

#### License

Copyright (c) 2016-2017. Stuart Watt.

Licensed under the MIT License.

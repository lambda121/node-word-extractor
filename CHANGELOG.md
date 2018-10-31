### 0.2.0 / 31st October 2018

- Module now exports an object with two methods `fromFile` and `fromBuffer`
- Remove bluebird and instead return a native Promise
- Publish on npm under the `gmr-fms` scope/organization

**non-public changes**

- Test buffer support by duplicating all file tests
- Remove unused code
- Decaffeinate, format using prettier, add eslint, and restructure some of
  the code

### 0.1.4 / 25th March 2017

- Fixed a documentation issue. `extract` returns a Promise. See #6
- Corrected table cell delimiters to be tabs. See #9
- Fixed an issue where replacements weren't being applied right.

### 0.1.3 / 6th July 2016

- Added the missing `lib` folder
- Added a missing dependency to `package.json`

### 0.1.1 / 17th January 2016

- Fixed a bug with text boundary calculations
- Added endpoints `getHeaders`, `getFootnotes`, `getAnnotations`

### 0.1.0 / 14th January 2016

- Initial release to npm

# Judge Candidate Textbook PDF Generator

This script converts [Judge Candidate Textbook](http://test.italianmagicjudges.net/wiki/) in PDF.


### Requirements
- [Node.js](https://nodejs.org/) >= v8.x
- Internet connection

### Getting started
- Clone repository `git clone https://github.com/imj/judge-textbook-pdf` or download the source `https://github.com/imj/judge-textbook-pdf/archive/master.zip`
- Install dependencies `npm install`
- Run the script `node index.js`


### Result
![PDF Generator](./__assets/textbook.gif)



### Strategy
It extracts all html content from Textbook pages; then it merges them in one single big html file and it uses Chrome Headless (managed by [puppeteer](https://github.com/GoogleChrome/puppeteer)) to generate a printable PDF.


## LICENSE
This package is available under the [MIT license](LICENSE).
# Elektron WebSocket API with Web Workers Example 
## Overview

[Elektron WebSocket API](https://developers.thomsonreuters.com/elektron/websocket-api-early-access) enables easy integration into a multitude of client technology environments such as scripting and web.  This API runs directly on your TREP infrastructure or the Thomson Reuters platform and presents data in an open (JSON) readable format. The API supports all Thomson Reuters Elektron data models and can be integrated into multiple client technology standards e.g. Python, R, .Net etc.

JavaScript is a single-threaded environment, the browsers's JavaScript runtime executes in single thread only. The HTML standard's Web Workers [Web Workers](https://html.spec.whatwg.org/multipage/workers.html) lets your web browsers run JavaScripts in background threads without blocking the UI. It can perform I/O, XMLHttpRequest and the WebSocket connection in a background thread while the main JavaScript thread handles UI interaction. 

There are two types of the Web Workers, [Dedicated Workers](https://html.spec.whatwg.org/multipage/workers.html#dedicated-workers-and-the-worker-interface) and [Shared Workers](https://html.spec.whatwg.org/multipage/workers.html#sharedworker). This article will cover only how to implement the Elektron WebSocket API JavaScript application with Dedicated Workers. 

## Supported Web Browsers
The example supports Chrome, Firefox and IE11 (based on the WebSocket and Web Workers browser supported).

## Prerequisite
The following libraries are required for this example. They are need to be downloaded separately:
1. [jQuery 3.2.1](https://jquery.com/)
2. [Bootstrap 3.3.7](https://getbootstrap.com/docs/3.3/)

## Example files
The web application contains the following example files and folder:
1. index.html: The application HTML page
2. app/market_price_app.js: The application main file
3. app/ws_worker.js: The application Web Workers file
4. css/cover.css: The application CSS file
5. libs/jquery-3.2.1.min.js: jQuery library file (need to be downloaded separately)
6. bootstrap/css, bootstarp/fonts and bootstrap/js folders: The folders for Bootstrap CSS and libraries files (need to be downloaded separately)

## How to run this example
1. Deploy the project in any web server
2. Open <web server>/index.html in the web browser (IE11, Chorme and Firefox)

## References
For further details, please check out the following resources:
* [Thomson Reuters Elektron WebSocket API page](https://developers.thomsonreuters.com/elektron/websocket-api-early-access) on the [Thomson Reuters Developer Community](https://developers.thomsonreuters.com/) web site.
* [Mozilla Developer Network: Web Workers API page](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
* [Google HTML5 Rocks: The Basics of Web Workers page](https://www.html5rocks.com/en/tutorials/workers/basics/)

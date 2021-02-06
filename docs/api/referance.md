## IDs

IDs are 64bit numbers calculated from the assbook epoch (2021.1.1). For example `12436686671880192`.

## REST API

Returns a JSONP response unless specified otherwise. To get a callback append `?callbaack=foo` or whatever name you want your call back function to be. [To learn more about jsonp read on wikipedia](https://en.wikipedia.org/wiki/JSONP).

> **Warning**, take this output as an unordered object. The order of those keys may change at any time!

### POSTing

While we do support form encoded HTTP bodies, JSON is the prefered choice.

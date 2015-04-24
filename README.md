# mytils
random utility dumping ground

**csvLinkExtractor**
sucks out urls from any csv, identified by the base url(s) you define in gather(). returns a series of object keys, including redirect, (final) http response, and 'parsed' keys that is a sub-object with the origin/redirect urls parsed into keys. 
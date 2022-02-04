# TopoDog
Topographic Dogs Behavior Tracking

## Project history
In 2015 David Morettini started a project of observation, data gathering and analysis of dogs behavior linked to his human/dog relations workshop format "Dimmi Chi Sei" (Tell me who you are).
David asked me to develop an application to help him in the activity of live recording a set of pre-defined, significant actions performed by dogs while exploring and interacting with a delimited environment.
The application allows to:
- graphically represent an environment with relevant elements (trees and other plants, water spots, benches etc)
- register in a session each dog that interacts with the environment assigning  a name, a description and a color
- record dogs actions with timestamp and direction attributes by selecting the action and click+drag on the scenario
- add comments on recorded actions
- show basic action statistics
- show/hide recorded actions by dog and/or by time intervals and analyze the recorded sessions on a timeline
- export/import recorded sessions as json file

## GETTING STARTED / DEVELOP
Launch a local webserver and open it in the browser. Example with php-cli command:
php -S 127.0.0.1:8000

## TODO
- Setup as PWA
- Setup free https hosting
- Review pointer events for modern devices compatibility

## ENHANCEMENTS
- load and position image into canvas background

## Suggested enhancements
- review and formalize the working data structures as a standard and interoperable dog behavior representation format
- migrate localstorage to indexeddb with https://localforage.github.io/localForage/
- pinch zoom
- two finger / left mouse button panning

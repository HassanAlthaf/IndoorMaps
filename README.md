# IndoorMaps
 A JavaScript framework that allows you to design interactive SVG maps with path-finding. Use this package on production at your own risk.
 
 **Current Status:** Implementation of Elevators and Staircases required to make use of the current multi-storey indoor mapping system.
 
 **Quick Links:**
 - [Installation](#installation)
 - [Configuration](#configuration)
 - [Screenshots](#screenshots)
## Installation
I have published this package on NPM [here](https://www.npmjs.com/package/@hassanalthaf/indoormaps). You may easily install the latest build by running this command:

`npm i @hassanalthaf/indoormaps`

You need to include the `src/indoormaps.js` into your HTML document.

##Configuration
```javascript
var indoorMaps = indoorMaps({
    config: {
        defaultZIndex: 0, // Current Floor
        validZIndexes: [0], // Valid Floors
        showHallwayPoints: false // Show Points on HallwayNodes (Shown below)
    },
    floorSections: [
        {
            id: 1, // Must be unique
            x: 20,
            y: 20,
            width: 100,
            height: 100,
            backgroundColor: "#03A9F4",
            label: {
                color: "rgb(255, 255, 255)",
                text: "Meeting Room",
                alignment: "center|center",
                fontStyle: "Verdana",
                fontSize: "12"
            },
            doors: [{ // Define entrances, can be multiple, if only one, use an array of a single object.
                x: 30,
                y: 130,
                actual: {
                    x: 30,
                    y: 120
                }
            }, {
                x: 10,
                y: 50,
                actual: {
                    x: 20,
                    y: 50
                }
            }]
        },
        ...
    ],
    // You need to define traversable nodes, including the door of each room.
    hallway: [
        {
            id: 1, // Must be unique
            x: 10,
            y: 130,
            connected: [5, 9] // Adjacent nodes. 
        },
        ...
    ]
});
```    
Sample Program is included in this repository.

## Screenshots

**Default View:**

![HassanAlthaf\IndoorMaps DefaultView](https://image.prntscr.com/image/v5YY8SHpTcmE0UmFtid3Fg.png)

**showHallwayPoints set to *true*:**

![HassanAlthaf\IndoorMaps](https://image.prntscr.com/image/0Gqg5i-HTT6WSjbeXuaNIg.png)

**Selected Path:**

![HassanAlthaf\IndoorMaps](https://image.prntscr.com/image/V6kbfn2yQOydzLTpSG9uGg.png)
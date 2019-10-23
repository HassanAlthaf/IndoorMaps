(function (global) {
    var IndoorMaps = function (options) {
        return new IndoorMaps.init(options);
    };

    let canvas;
    let context;

    IndoorMaps.init = function (options) {
        canvas = global.document.getElementById("indoor-map");
        canvas.width = global.innerWidth; //document.width is obsolete
        canvas.height = global.innerHeight; //document.height is obsolete
        var canvasW = canvas.width;
        var canvasH = canvas.height;

        if (canvas.getContext) {
            context = canvas.getContext('2d');
        } else {
            throw "Whoops! Context for the canvas was not found.";
        }

        this.drawMap(options.floorSections || {});

        //alert(JSON.stringify(options));
    };

    IndoorMaps.init.prototype = {
        drawMap: function (floorSections) {
            for (let i = 0; i < floorSections.length; i++) {
                let section = floorSections[i];

                if (
                    section.x === undefined
                    || section.y === undefined
                    || section.width === undefined
                    || section.height === undefined
                ) {
                    throw "The x,y coordinates and the width and height are required fields.";
                }

                context.fillStyle = section.backgroundColor || "rgb(255, 255, 255, 1)";
                context.fillRect(section.x, section.y, section.width, section.height);

                if (section.label !==  undefined) {
                    if (section.label.text === undefined) {
                        throw "The text must be included for the label to be shown. Set label as null if you do not wish to display a label.";
                    }

                    context.font = section.label.fontStyle || "15px Arial";
                    context.fillStyle = section.label.color || "rgb(0, 0, 0)";

                    let xCoordinate = section.x + section.label.x;
                    let yCoordinate = section.y + section.label.y;

                    if (section.label.alignment === "center") {
                        xCoordinate = section.x + (section.width / 2);
                        yCoordinate = section.y + (section.height / 2);

                        context.textAlign = "center";
                    }

                    context.fillText(section.label.text, xCoordinate, yCoordinate);
                }
            }
        }
    };

    window.indoorMaps = IndoorMaps;
}(window));
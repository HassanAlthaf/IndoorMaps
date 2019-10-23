(function (global) {
    var IndoorMaps = function (options) {
        return new IndoorMaps.init(options);
    };

    let svgRootNode;
    let doors = {};
    let hallwayPoints = {};

    IndoorMaps.init = function (options) {
        // Creating the root SVG Node on DOM.
        svgRootNode = this.createSvgNode("svg", {
            height: "100%",
            width: "100%"
        });

        this.appendToBody(svgRootNode);

        // Render the Map
        this.drawMap(options.floorSections || {});
        this.parseHallwayPoints(options.hallway || {});
        this.displayHallwayPoints(options.hallway || {});

        //alert(JSON.stringify(options));

        let paths = this.findPaths(2, 3);

        let shortestPath = this.findShortestPath(paths);

        this.drawPath(paths[1]);
    };

    IndoorMaps.init.prototype = {
        createSvgNode: function (elementName, attributes = {}, value) {
            if (elementName === undefined) {
                throw "Element name not found!";
            }

            let node = document.createElementNS("http://www.w3.org/2000/svg", elementName);

            for (let attributeKey in attributes) {
                node.setAttribute(attributeKey, attributes[attributeKey]);
            }

            if (value !== undefined) {
                node.innerHTML = value;
            }

            return node;
        },
        appendToBody: function (node) {
            window.document.body.appendChild(node);
        },
        draw: function (node) {
            svgRootNode.append(node);
        },
        addDoor: function(roomId, coordinates) {
            doors[roomId] = coordinates;

            let point = this.createSvgNode("circle", {
                cx: coordinates.x,
                cy: coordinates.y,
                r: 4,
                fill: "red"
            });

            this.draw(point);
        },
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

                let node = this.createSvgNode("rect", {
                    'data-id': section.id || '',
                    x: section.x,
                    y: section.y,
                    width: section.width,
                    height: section.height,
                    fill: section.backgroundColor || "#EEEEEE"
                });

                this.draw(node);
                this.addDoor(section.id, section.door);

                if (section.label === undefined) {
                    continue;
                }

                if (section.label.text === undefined) {
                    throw "The text must be included for the label to be shown. Set label as null if you do not wish to display a label.";
                }

                xCoordinate = section.x + (section.label.x || 0);
                yCoordinate = section.y + (section.label.y || 0);

                let attributes = {
                    'x': xCoordinate,
                    'y': yCoordinate,
                    'fill': section.label.color,
                    'font-family': section.label.fontStyle,
                    'font-size': section.label.fontSize
                };

                if (section.label.alignment !== undefined) {
                    switch (section.label.alignment) {
                        case "center|center":
                            attributes['text-anchor'] = "middle";
                            attributes['dominant-baseline'] = "middle";
                            attributes['x'] = (section.width / 2) + section.x;
                            attributes['y'] = (section.height / 2) + section.y;
                            break;
                        case "horizontal_center":
                            attributes['text-anchor'] = "middle";
                            attributes['x'] = (section.width / 2) + section.x;
                            break;
                        case "vertical_center":
                            attributes['dominant-baseline'] = "middle";
                            attributes['y'] = (section.height / 2) + section.y;
                            break;
                        default:
                            throw "Alignment mode requested was not found.";
                    }

                    if (section.label.alignment === "center|center") {

                    }
                }

                let textNode = this.createSvgNode("text", attributes, section.label.text);

                this.draw(textNode);
            }
        },

        drawPath: function(path) {
            // Line requires an adjacent point, the last doesn't. Hence, points - 1.
            for (let i = 0; i < (path.length - 1); i++) {
                let lineNode = this.createSvgNode('line', {
                    x1: path[i].x,
                    y1: path[i].y,
                    x2: path[i + 1].x,
                    y2: path[i + 1].y,
                    stroke: "green"
                });

                this.draw(lineNode);
            }
        },

        displayHallwayPoints: function (hallwayNodes) {
            for (let i = 0; i < hallwayNodes.length; i++) {
                this.draw(
                    this.createSvgNode("circle", {
                        cx: hallwayNodes[i].x,
                        cy: hallwayNodes[i].y,
                        r: 2,
                        fill: "black"
                    })
                );
            }

            console.log(hallwayNodes);
        },
        findPaths: function (startId, endId) {
            console.log(
                "Start ID: " + JSON.stringify(doors[startId]) + "\n\n"
                + "End ID: " + JSON.stringify(doors[endId])
            );

            console.log(
                "Starting Point: " + JSON.stringify(this.findPointByCoordinates(doors[startId])) + "\n\n"
                + "Ending Point: " + JSON.stringify(this.findPointByCoordinates(doors[endId]))
            );

            let startingPoint = this.findPointByCoordinates(doors[startId]);
            let endingPoint = this.findPointByCoordinates(doors[endId]);
            let paths = this.recursiveIterationOfPoints([startingPoint], endingPoint);

            return paths;
        },
        recursiveIterationOfPoints: function(path, end) {
            let results = [];
            let current = path[path.length - 1];

            if (current.id === end.id) {
                return [path];
            }

            for (let i = 0; i < current.connected.length; i++) {
                let nextPoint = hallwayPoints[current.connected[i]];

                let found = false;

                path.forEach( function (point, index) {
                    if (point.id === nextPoint.id) {
                        found = true;
                    }
                });

                if (found)
                    continue;

                var newPath = path.slice();
                newPath.push(nextPoint);

                results = results.concat(this.recursiveIterationOfPoints(newPath, end));
            }

            return results;
        },
        findPointByCoordinates: function (coordinates) {
            for (let id in hallwayPoints) {
                let point = hallwayPoints[id];

                if (point.x === coordinates.x && point.y === coordinates.y) {
                    return point;
                }
            }
        },
        parseHallwayPoints: function (points) {
            for (let i = 0; i < points.length; i++) {
                hallwayPoints[points[i].id] = points[i];
            }
        },
        findShortestPath: function(paths) {
            if (paths.length === 1)
                return paths[0];

            // Set benchmark range
            let shortestDistance = this.calculateDistanceForPath(paths[0]);
            let shortestPath = paths[0];

            // Skip the first since it's already calculated.
            for (let i = 1; i < paths.length; i++) {
                let distance = this.calculateDistanceForPath(paths[i]);

                if (distance < shortestDistance) {

                    shortestDistance = distance;
                    shortestPath = paths[i];
                }
            }

            return shortestPath;
        },
        calculateDistanceForPath: function(path) {
            let totalDistance = 0;

            for (let i = 0; i < (path.length - 1); i++) {
                // Formula: sqrt[(x0 - x1)^2 + (y0 - y1)^2]
                totalDistance += Math.sqrt(Math.pow(path[i].x - path[i + 1].x, 2) + Math.pow(path[i].y - path[i + 1].y, 2));
            }

            console.log(totalDistance);

            return totalDistance;
        }
    };

    window.indoorMaps = IndoorMaps;
}(window));
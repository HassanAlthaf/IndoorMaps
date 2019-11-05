(function (global) {
    var IndoorMaps = function (options) {
        return new IndoorMaps.init(options);
    };

    let svgRootNode;
    let doors = {};
    let hallwayPoints = {};

    let currentZIndex = 0;
    let validZIndexes = [0];

    let svgDimensions = {};

    let floorPlan = [];

    let mapSelection = null;

    IndoorMaps.init = function (options) {
        this.parseConfiguration(options || {});
        this.parseFloorPlan(options.floorSections || {});
        this.parseHallwayPoints(options.hallway || {});
        // Loop through everything and find max width/height required.

        svgDimensions = this.calculateSVGWidthAndHeight();

        // Creating the root SVG Node on DOM.
        svgRootNode = this.createSvgNode("svg", {
            /*
            width: svgDimensions.width + 5, // max width from above
            height: svgDimensions.height + 5, // max height from above*/
            width: '100%',
            height: '100%'
        });

        this.appendToBody(svgRootNode);

        // Render the Map
        this.drawMap(floorPlan[currentZIndex] || {});

        // Parsing

        this.displayHallwayPoints(options.hallway || {});

        // Pathfinding

        /*
        let paths = this.findPaths(52, 53);

        let shortestPath = this.findShortestPath(paths);

        this.drawPath(shortestPath);
        */
        return svgRootNode;
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
            let panZoom = svgRootNode.querySelector('.svg-pan-zoom_viewport');

            if (!panZoom) {
                svgRootNode.append(node);
            } else {
                panZoom.append(node);
            }
        },
        addDoors: function(roomId, doorPoints) {
            doors[roomId] = doorPoints;

            for (let i = 0; i < doorPoints.length; i++) {
                let coordinates = doorPoints[i];

                let attributes = {
                    x: coordinates.x,
                    y: coordinates.y,
                    width: coordinates.width || 3,
                    height: coordinates.height || 3,
                    fill: "#FF0000"
                };

                if (coordinates.width > coordinates.height) {
                    attributes.x -= coordinates.width / 2;
                    attributes.y -= coordinates.height;
                }

                if (coordinates.height > coordinates.width) {
                    attributes.x -= coordinates.width;
                    attributes.y -= coordinates.height / 2;
                }

                let rect = this.createSvgNode("rect", attributes);

                this.draw(rect);
            }
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

                let thisObject = this;

                node.addEventListener("click", function (e) {
                    if (mapSelection === null) {
                        thisObject.removeRouteIndicators();
                        mapSelection = this;
                        this.classList.add('selected');
                    } else {
                        console.log(mapSelection.dataset.id + " : " + this.dataset.id);
                        let paths = thisObject.findPaths(mapSelection.dataset.id, this.dataset.id);

                        let shortestPath = thisObject.findShortestPath(paths);

                        thisObject.drawPath(shortestPath);

                        mapSelection = null;
                        this.classList.add('destination');
                    }
                });

                this.draw(node);
                this.addDoors(section.id, section.doors);

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
                    'fill': section.label.color || '#333333',
                    'font-family': section.label.fontStyle || 'Verdana',
                    'font-size': section.label.fontSize || '10'
                };

                if (section.label.alignment === undefined) {
                    section.label.alignment = "center|center";
                }

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
                }

                let textNode = this.createSvgNode("text", attributes, section.label.text);

                this.draw(textNode);
            }
        },

        drawPath: function(path) {
            for (let i = 0; i < (path.length - 1); i++) {
                let lineNode = this.createSvgNode('line', {
                    x1: path[i].x,
                    y1: path[i].y,
                    x2: path[i + 1].x,
                    y2: path[i + 1].y,
                    stroke: "green",
                    'data-type': "route"
                });

                this.draw(lineNode);
            }
        },

        removeRouteIndicators: function () {
            let nodes = svgRootNode.querySelectorAll('[data-type="route"]');
            let panZoom = svgRootNode.querySelector('.svg-pan-zoom_viewport');

            for (let index = 0; index < nodes.length; index++) {
                if (!panZoom) {
                    svgRootNode.removeChild(nodes[index]);
                } else {
                    panZoom.removeChild(nodes[index]);
                }
            }

            nodes = svgRootNode.getElementsByClassName('selected');

            for (let index = 0; index < nodes.length; index++) {
                nodes[index].classList.remove('selected');
            }

            nodes = svgRootNode.getElementsByClassName('destination');

            for (let index = 0; index < nodes.length; index++) {
                nodes[index].classList.remove('destination');
            }
        },

        displayHallwayPoints: function (hallwayNodes) {
            for (let i = 0; i < hallwayNodes.length; i++) {
                this.draw(
                    this.createSvgNode("circle", {
                        cx: hallwayNodes[i].x,
                        cy: hallwayNodes[i].y,
                        r: 2,
                        fill: hallwayNodes[i].fill || "black",
                        'data-id': hallwayNodes[i].id
                    })
                );
            }


        },
        findPaths: function (startId, endId) {
            let paths = [];
            let startDoors = doors[startId];
            let endDoors   = doors[endId];

            for (let i = 0; i < startDoors.length; i++) {
                let startingPoint = this.findPointByCoordinates(startDoors[i]);
                console.log("Starting Point: " + JSON.stringify(startingPoint));

                for (let j = 0; j < doors[endId].length; j++) {
                    let endingPoint = this.findPointByCoordinates(endDoors[j]);
                    console.log("Ending Point: " + JSON.stringify(endingPoint));

                    let potentialPath = this.recursiveIterationOfPoints([startingPoint], endingPoint);

                    console.log(potentialPath);

                    paths = paths.concat(potentialPath);
                }
            }

            for (let id in paths) {
                paths[id] = this.linkRoomsWithPath(paths[id], startId, endId);
            }

            return paths;
        },
        recursiveIterationOfPoints: function(path, end) {
            let results = [];
            let current = path[path.length - 1];

            console.log(current);

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

                //console.log(nextPoint.id);

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
        findActualCoordinatesOfDoorByCoordinates: function (coordinates, roomId) {
            let validDoors = doors[roomId];

            for (let id in validDoors) {
                if (validDoors[id].x === coordinates.x && validDoors[id].y === coordinates.y) {
                    return validDoors[id].actual;
                }
            }
            /*
            for (let id in doors) {

                for (let i = 0; i < doors[id].length; i++) {
                    if (doors[id][i].x === coordinates.x && doors[id][i].y === coordinates.y) {
                        return doors[id][i].actual;
                    }
                }
            }*/
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

            return totalDistance;
        },
        linkRoomsWithPath: function (path, startId, endId) {
            let first = this.findActualCoordinatesOfDoorByCoordinates(path[0], startId);
            let last  = this.findActualCoordinatesOfDoorByCoordinates(path[path.length - 1], endId);

            path.unshift(first);
            path.push(last);

            return path;
        },

        parseConfiguration: function (options) {
            currentZIndex = options.config.defaultZIndex || 0;
            validZIndexes = options.config.validZIndexes || [0];
        },

        parseFloorPlan: function (floorLayout) {
            for (let i in floorLayout) {
                if (floorLayout[i].z === undefined) {
                    floorLayout[i].z = 0;
                }

                if (!(floorLayout[i].z in floorPlan)) {
                    floorPlan[floorLayout[i].z] = [];
                }

                floorPlan[floorLayout[i].z].push(floorLayout[i]);
            }
        },

        calculateSVGWidthAndHeight: function () {
            let dimensions = {
                width: 0,
                height: 0
            };

            let floorLayout = floorPlan[currentZIndex];
            let first = true;

            for (let i in floorLayout) {
                let calculatedWidth  = floorLayout[i].width + floorLayout[i].x;
                let calculatedHeight = floorLayout[i].height + floorLayout[i].y;

                if (first) {
                     dimensions.width = calculatedWidth;
                     dimensions.height = calculatedHeight;

                     first = false;
                }

                if (calculatedWidth > dimensions.width) {

                    dimensions.width = calculatedWidth;
                }


                if (calculatedHeight > dimensions.height) {
                    dimensions.height = calculatedHeight;
                }
            }

            for (let i in hallwayPoints) {
                let currentWidth = hallwayPoints[i].x;
                let currentHeight = hallwayPoints[i].y;

                if (currentWidth > dimensions.width) {
                    dimensions.width = currentWidth;
                }

                if (currentHeight > dimensions.height) {
                    dimensions.height = currentHeight;
                }

            }

            return dimensions;
        }
    };

    window.indoorMaps = IndoorMaps;
}(window));
var indoorMaps = indoorMaps({
    floorSections: [
        {
            id: 1,
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
            doors: [{
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
        {
            id: 2,
            x: 140,
            y: 20,
            width: 200,
            height: 100,
            backgroundColor: "#8BC34A",
            label: {
                color: "rgb(255, 255, 255)",
                text: "Pantry",
                alignment: "center|center",
                fontStyle: "Verdana",
                fontSize: "12"
            },
            doors: [{
                x: 130,
                y: 40,
                actual: {
                    x: 140,
                    y: 40
                }
            }]
        },
        {
            id: 3,
            x: 0,
            y: 140,
            width: 500,
            height: 100,
            backgroundColor: "#795548",
            label: {
                color: "rgb(255, 255, 255)",
                text: "Workspace",
                alignment: "center|center",
                fontStyle: "Verdana",
                fontSize: "12"
            },
            doors: [{
                x: 250,
                y: 130,
                actual: {
                    x: 250,
                    y: 140
                }
            }]
        }
    ],
    hallway: [
        {
            id: 1,
            x: 10,
            y: 130,
            connected: [5, 9]
        },
        {
            id: 2,
            x: 130,
            y: 130,
            connected: [5, 7, 6]
        },
        {
            id: 3,
            x: 340,
            y: 130,
            connected: [7]
        },
        {
            id: 4,
            x: 130,
            y: 10,
            connected: [6, 8]
        },
        {
            id: 5,
            x: 30,
            y: 130,
            connected: [1, 2]
        },
        {
            id: 6,
            x: 130,
            y: 40,
            connected: [2, 4]
        },
        {
            id: 7,
            x: 250,
            y: 130,
            connected: [2, 3]
        },
        {
            id: 8,
            x: 10,
            y: 10,
            connected: [9, 4]
        },
        {
            id: 9,
            x: 10,
            y: 50,
            connected: [1, 8]
        }
    ]
});


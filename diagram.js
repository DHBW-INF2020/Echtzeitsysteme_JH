var $ = go.GraphObject.make;
let activityTemplate =
    new go.Node("Auto")  // the Shape will automatically surround the TextBlock
        // add a Shape and a TextBlock to this "Auto" Panel
        .add(new go.Shape("RoundedRectangle",
            { strokeWidth: 1, fill: "white" })  // 1 border; default fill is white
            .bind("fill", "color"))  // Shape.fill is bound to Node.data.color
        .add(new go.Panel("Table", { defaultAlignment: go.Spot.Left })
            .add(new go.TextBlock({ text: "Name: ", row: 0, column: 0 }))
            .add(new go.TextBlock({ margin: 8, stroke: "#333", row: 0, column: 1 })  // some room around the text
                .bind("text", "name"))
            .add(new go.TextBlock({ text: "Id: ", row: 1, column: 0 }))
            .add(new go.TextBlock({ margin: 8, stroke: "#333", row: 1, column: 1 })  // some room around the text
                .bind("text", "key")));

let mutexTemplate =
    new go.Node("Auto")  // the Shape will automatically surround the TextBlock
        // add a Shape and a TextBlock to this "Auto" Panel
        .add(new go.Shape("Hexagon",
            { strokeWidth: 1, fill: "white", angle: 90 })  // 1 border; default fill is white
            .bind("fill", "color"))  // Shape.fill is bound to Node.data.color
        .add(new go.Panel("Table", { defaultAlignment: go.Spot.Left })
            .add(new go.TextBlock({ text: "Name: ", row: 0, column: 0 }))
            .add(new go.TextBlock({ margin: 8, stroke: "#333", row: 0, column: 1 })  // some room around the text
                .bind("text", "name"))
            .add(new go.TextBlock({ text: "Id: ", row: 1, column: 0 }))
            .add(new go.TextBlock({ margin: 8, stroke: "#333", row: 1, column: 1 })  // some room around the text
                .bind("text", "key")));

let arrowTemplate = $(go.Link,
    $(go.Shape, { stroke: "black", strokeWidth: 1 }),
    $(go.Shape, { toArrow: "Standard", stroke: "black" })
  );

let noarrowTemplate = $(go.Link,
        $(go.Shape, { stroke: "black", strokeWidth: 2 })
    );
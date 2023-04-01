var $ = go.GraphObject.make;

let activityTemplate = $(go.Node, "Auto",

$(go.Shape, "RoundedRectangle", new go.Binding("stroke", "color"), { fill: "white", stroke: "black", parameter1: 15 }),
$(go.Panel, "Table",
  { defaultRowSeparatorStroke: "black" },
  $(go.TextBlock, new go.Binding("text", "task"), { row: 0, margin: 0, font: "14pt sans-serif"}),
  $(go.TextBlock, new go.Binding("text", "name"), { row: 1, margin: 5 })
)
);

let mutexTemplate =
  $(go.Node, "Auto", // the Shape will automatically surround the TextBlock
    // add a Shape and a TextBlock to this "Auto" Panel
    $(go.Shape, "Hexagon", {
      strokeWidth: 1,
      fill: "white",
      angle: 90
    }, // 1 border; default fill is white
      new go.Binding("fill", "color")), // Shape.fill is bound to Node.data.color
    $(go.TextBlock, {
      margin: 2,
      textAlign: "center"
    }, new go.Binding("text", "name"))
  );

let startTemplate =
    $(go.Node, "Auto",{ portId: "", locationSpot: go.Spot.Bottom },
        $(go.Shape, "Circle", { fill: "gray", width: 30, height: 30 }),
        $(go.TextBlock, { text: "S" })
    );

let arrowTemplate = $(go.Link, { curve: go.Link.Bezier, layerName: "Foreground" },
  $(go.Shape, { stroke: "black", strokeWidth: 1 }),
  $(go.Shape, { toArrow: "Standard", stroke: "black" }),
  $(go.Panel, "Table",
  $(go.TextBlock,                        // this is a Link label
    new go.Binding("text", "value"), { row: 1, font: "12pt sans-serif", background: "gray", stroke: "white", width: 12, height: 18, textAlign: "center" }),
  $(go.TextBlock,                        // this is a Link label
    new go.Binding("text", "name"), { row: 0, font: "10pt sans-serif", stroke: "black", textAlign: "center" })
  )
  
);

let sameTaskArrowTemplate = $(go.Link, { curve: go.Link.Bezier },
    $(go.Shape, { stroke: "black", strokeWidth: 1 }),
    $(go.Shape, { toArrow: "OpenTriangle", stroke: "black" })
);

let noarrowTemplate = $(go.Link,
    $(go.Shape, { stroke: "black", strokeWidth: 2 })
);

let startLinkTemplate = $(go.Link,
    $(go.Shape, { stroke: "black", strokeWidth: 2 }),
    { // stellen Sie sicher, dass das Link-Element immer am unteren Rand der Node ankommt
        fromPortId: "",
        toPortId: "",
        toSpot: go.Spot.Bottom,
        toLinkable: true,
        toMaxLinks: 1
      }
);

let mutexLinkTemplate = $(go.Link,
    $(go.Shape, { stroke: "black", strokeWidth: 2, strokeDashArray: [4, 4] })
);
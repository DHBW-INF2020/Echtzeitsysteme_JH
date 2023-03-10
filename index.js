var BUTTON_IMPORT = document.getElementById("btn-import")
var BUTTON_GENERATE = document.getElementById("btn-generate")
var BUTTON_STEP = document.getElementById("btn-step")
var INPUT_FILE = document.getElementById("file-upload")
var CANVAS = document.getElementById("canvas")

var csvFile

function Init() {
}

function importCSV() {
    console.log("import CSV")
    console.log(csvFile);
    document.getElementById("label-import").innerHTML = "<strong>" + csvFile.name + "</strong>" + " imported"
    if (csvFile.size > 0) {
        BUTTON_GENERATE.disabled = false
        read(showFile)
    }
}

function generateDiagram(array) {
    console.log("generate diagram")
    var $ = go.GraphObject.make;
    var myDiagram = $(go.Diagram, "myDiagramDiv");

    myDiagram.nodeTemplate =
        new go.Node("Auto")  // the Shape will automatically surround the TextBlock
            // add a Shape and a TextBlock to this "Auto" Panel
            .add(new go.Shape("RoundedRectangle",
                { strokeWidth: 0, fill: "white" })  // no border; default fill is white
                .bind("fill", "color"))  // Shape.fill is bound to Node.data.color
            .add(new go.TextBlock({ margin: 8, stroke: "#333" })  // some room around the text
                .bind("text", "key"));  // TextBlock.text is bound to Node.data.key

    var arr = [];
    array.forEach(element => {
        console.log(element);
        arr.push({ key: element })
    });

    var con = [
        { from: "1", to: "2" },
        { from: "1", to: "3"}
        ];

    myDiagram.model = new go.GraphLinksModel(arr, con)
}

function nextStep() {
    console.log("next step")
}

function uploadFile() {
    console.log("upload")
    BUTTON_IMPORT.disabled = false
    csvFile = INPUT_FILE.files[0]
}

function read(callback) {
    const file = csvFile
    const reader = new FileReader();

    reader.onload = () => {
        callback(reader.result);
    };

    reader.readAsText(file);
}

function showFile(result) {
    console.log(result);
    var rowData = result.split("\n")

    var theadEl = document.getElementById('tblcsvdata').getElementsByTagName('thead')[0].getElementsByTagName("tr")[0];

    var tbodyEl = document.getElementById('tblcsvdata').getElementsByTagName('tbody')[0];


    var rowColData = rowData[0].split(',');

    var headRow = ""
    // Loop on the row column Array
    for (var col = 0; col < rowColData.length; col++) {

        headRow += "<th>" + rowColData[col] + "</th>"

    }

    console.log(headRow);
    theadEl.innerHTML = headRow

    var ids = []

    for (var row = 1; row < rowData.length; row++) {



        // Insert a row at the end of table
        var newRow = tbodyEl.insertRow();

        // Split by comma (,) to get column Array
        rowColData = rowData[row].split(',');

        ids.push(rowColData[0])

        // Loop on the row column Array
        for (var col = 0; col < rowColData.length; col++) {

            // Insert a cell at the end of the row
            var newCell = newRow.insertCell();
            newCell.innerHTML = rowColData[col];

        }

    }

    generateDiagram(ids)
}
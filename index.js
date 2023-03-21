
var BUTTON_IMPORT = document.getElementById("btn-import")
var BUTTON_GENERATE = document.getElementById("btn-generate")
var BUTTON_STEP = document.getElementById("btn-step")
var INPUT_FILE = document.getElementById("file-upload")
var CANVAS = document.getElementById("canvas")

var csvFile

let Tasks = []
let Activities = []
let Semaphores = []

function Init() {

}

function importCSV() {
    console.log("import CSV")
    console.log(csvFile);
    document.getElementById("label-import").innerHTML = "<strong>" + csvFile.name + "</strong>" + " imported"
    if (csvFile.size > 0) {
        BUTTON_GENERATE.disabled = false
        read(cb_read)
    }
}

function generateDiagram(elements, connections) {
    console.log("generate diagram")
    var $ = go.GraphObject.make;
    var myDiagram = $(go.Diagram, "myDiagramDiv");
    myDiagram.isReadOnly = true

    myDiagram.nodeTemplate =
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

    var arr = [];
    elements.forEach(element => {
        console.log(element);
        arr.push({ key: element.id, name: element.name })
    });

    let con = []

    connections.forEach((sempahore) => {
        con.push({ from: sempahore.fromActivity, to: sempahore.toActivity })
    })
    console.log("[CONNECTIONS:]")
    con.forEach((connection) => {
        console.log(connection);
    })


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

function cb_read(csvArray) {

    fillTable(csvArray)

    console.log(csvArray);
    createObjects(csvArray)
    //generateDiagram(Activities, Semaphores)
}

function createObjects(csvArray) {
    var rows = csvArray.split("\n")
    console.log("[ROWS]: " + rows);

    // Add Semaphores
    // Add Activities and add Semaphores to it
    // Add Tasks and add Activities to it

    // Add Mutexes?

    rows.forEach((element) => {
        let rowCol = element.split(",")
        let type = rowCol[1], id = rowCol[0], name = rowCol[2]
        if (type == 3) {
            Semaphores.push(new Semaphore(id, name, rowCol[7], null, rowCol[5], rowCol[6]))
        }
    })

    rows.forEach((element) => {
        let rowCol = element.split(",")
        let type = rowCol[1], id = rowCol[0], name = rowCol[2]

        // Activities
        if (type == 2) {
            var activity = new Activity(id, name, rowCol[4], null, null, null, rowCol[3])
            Semaphores.forEach((semaphore) => {
                if (semaphore.toActivity == id) {
                    activity.semaphoresFrom.push(semaphore)
                }
                if (semaphore.fromActivity == id) {
                    activity.semaphoresTo.push(semaphore)
                }
            })
            Activities.push(activity)
        }
    })

    rows.forEach((element) => {
        let rowCol = element.split(",")
        let type = rowCol[1], id = rowCol[0], name = rowCol[2]
        // Tasks
        if (type == 1) {
            var task = new Task(id, name)
            Activities.forEach((activity) => {
                if (activity.ofTaskId == id) {
                    task.activities.push(activity)
                }
            })
            Tasks.push(task)
            console.log("[TASKS] added: " + name);
        }
    })

    console.log("[TASKS]: ")
    Tasks.forEach((task, i) => {
        console.log(i + ": " + task.name);
        console.log(task);
    })

    console.log("[ACTIVITIES]: ")
    Activities.forEach((activity, i) => {
        console.log(i + ": " + activity.name);
        console.log(activity);
    })

    console.log("[SEMAPHORES]: ")
    Semaphores.forEach((semaphore, i) => {
        console.log(i + ": " + semaphore.name);
        console.log(semaphore);
    })

}

function fillTable(csvArray) {
    console.log(fillTable.name + ": " + csvArray);
    var rowData = csvArray.split("\n")

    var theadEl = document.getElementById('tblcsvdata').getElementsByTagName('thead')[0].getElementsByTagName("tr")[0];

    var tbodyEl = document.getElementById('tblcsvdata').getElementsByTagName('tbody')[0];


    var rowColData = rowData[0].split(',');
    console.log("LE: " + rowColData.length);

    var headRow = ""
    // Loop on the row column Array
    for (var col = 0; col < (rowColData.length - 1); col++) {

        headRow += "<th>" + rowColData[col] + "</th>"
        console.log("LE: " + col);
    }

    console.log(headRow);
    theadEl.innerHTML = headRow

    var ids = []

    for (var row = 1; row < rowData.length; row++) {



        // Insert a row at the end of table
        var newRow = tbodyEl.insertRow();

        // Split by comma (,) to get column Array
        rowColData = rowData[row].split(',');

        // if type == 1 -> Task
        if (rowColData[1] = 1) {
            //var task = new Task(rowColData[0], rowColData[1], new Activity())
        }


        ids.push(rowColData[0])

        // Loop on the row column Array
        for (var col = 0; col < rowColData.length; col++) {

            // Insert a cell at the end of the row
            var newCell = newRow.insertCell();
            newCell.innerHTML = rowColData[col];

        }

    }
}
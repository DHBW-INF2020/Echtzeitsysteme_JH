const SEPARATOR = ";"

var BUTTON_IMPORT = document.getElementById("btn-import")
var BUTTON_GENERATE = document.getElementById("btn-generate")
var BUTTON_STEP = document.getElementById("btn-step")
var INPUT_FILE = document.getElementById("file-upload")
var CANVAS = document.getElementById("canvas")

var csvFile

let Tasks = []
let Activities = []
let Semaphores = []
let Mutexs = []


function Init() {
    console.log("INIT");
}

function importCSV() {
    console.log("import CSV")
    console.log(csvFile);
    document.getElementById("label-import").innerHTML = "<strong>" + csvFile.name + "</strong>" + " imported"
    if (csvFile.size > 0) {
        BUTTON_GENERATE.disabled = false
        read(cb_read, csvFile)
    }
}



function onClickGenerateDiagram() {
    generateDiagram(Activities, Semaphores, Mutexs);
}

function generateDiagram(elements, connections, mutexs) {
    console.log("generate diagram")
    console.log(elements);
    console.log(connections);
    console.log(mutexs);
    //var $ = go.GraphObject.make;
    var myDiagram = $(go.Diagram, "myDiagramDiv");
    myDiagram.isReadOnly = true



    const nodeTemplmap = new go.Map(); // In TypeScript you could write: new go.Map<string, go.Node>();
    // for each of the node categories, specify which template to use
    nodeTemplmap.add("activity", activityTemplate);
    nodeTemplmap.add("mutex", mutexTemplate);

    myDiagram.nodeTemplateMap = nodeTemplmap

    const linkTemplmap = new go.Map()
    linkTemplmap.add("arrow", arrowTemplate)
    linkTemplmap.add("noarrow", noarrowTemplate)

    myDiagram.linkTemplateMap = linkTemplmap

    var arr = [];
    let con = [];


    elements.forEach(element => {
        console.log(element);
        arr.push({ key: element.id, name: element.name, category: "activity"})
    });

    mutexs.forEach(mutex => {
        console.log("M: ");
        console.log(mutex);
        arr.push({ key: mutex.id, name: mutex.name, color: "red", category: "mutex" })
        mutex.activities.forEach(activity => {
            con.push({ from: mutex.id, to: activity.id, category: "noarrow" })
        });
    });



    connections.forEach((semaphore) => {
        if (semaphore.initValue != "m" && semaphore.initValue != "m\r") {
            con.push({ from: semaphore.fromActivity, to: semaphore.toActivity, category: "arrow" })
            console.log("CON: " + semaphore.initValue);
        }
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


/**
 * Reads/imports the given file
 * the file is available via the callback function
 * @param callback The callback function
 * @param file The file to read/import
 */
function read(callback, file) {
    const reader = new FileReader();

    reader.onload = () => {
        callback(reader.result);
    };

    reader.readAsText(file);
}

/**
 * Callback of the read function
 * @param result The imported file
 */
function cb_read(result) {
    console.log("Callback");

    fillTable(result)

    console.log(result);
    createObjects(result)
    generateDiagram(Activities, Semaphores, Mutexs)
}

function createObjects(csvArray) {
    var rows = csvArray.split("\n")
    console.log("[ROWS]: " + rows);

    // Add Semaphores
    // Add Activities and add Semaphores to it
    // Add Tasks and add Activities to it

    // Add Mutexes?

    rows.forEach((element) => {
        let rowCol = element.split(SEPARATOR)
        let type = rowCol[1], id = rowCol[0], name = rowCol[2]
        if (type == 3) {
            Semaphores.push(new Semaphore(id, name, rowCol[7], null, rowCol[5], rowCol[6]))
        }
    })

    rows.forEach((element) => {
        let rowCol = element.split(SEPARATOR)
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
        let rowCol = element.split(SEPARATOR)
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

    rows.forEach((element) => {
        let rowCol = element.split(SEPARATOR)
        let type = rowCol[1], id = rowCol[0], name = rowCol[2]
        // Mutex
        if (type == 4) {
            var mutex = new Mutex(id, name)
            Activities.forEach((activity) => {
                if (activity.semaphoresFrom.some(e => e.fromActivity == id) || activity.semaphoresTo.some(e => e.toActivity == id)) {
                    mutex.activities.push(activity)
                    console.log("MA: pushed " + activity.name);
                }
            })
            Mutexs.push(mutex)
            console.log("[MUTEX] added: " + name);
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


    var rowColData = rowData[0].split(SEPARATOR);
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
        rowColData = rowData[row].split(SEPARATOR);

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
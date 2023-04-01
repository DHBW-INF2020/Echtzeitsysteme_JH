const SEPARATOR = ";"

var BUTTON_IMPORT = document.getElementById("btn-import")
var BUTTON_GENERATE = document.getElementById("btn-generate")
var BUTTON_STEP = document.getElementById("btn-step")
var INPUT_FILE = document.getElementById("file-upload")
var CANVAS = document.getElementById("canvas")

var csvFile

let Starts = []
let Tasks = []
let Activities = []
let Semaphores = []
let Mutexs = []

let Running = []

var myDiagram

var aktuellerTakt = 0

// DEBUG START

//Debug();

function Debug() {
    const request = new XMLHttpRequest();
    request.open("GET", "testData.csv", true);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            const csvData = request.responseText;
            // Hier können Sie Ihre CSV-Daten verwenden
            createObjects(csvData)
            setTimeout(generateDiagram(Starts, Activities, Semaphores, Mutexs), 200);
        }
    };
    request.send();
    
    
}

// DEBUG END

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
    generateDiagram(Starts, Activities, Semaphores, Mutexs);
    BUTTON_STEP.disabled = false
    //diagram.requestUpdate();
}

function generateDiagram(starts, elements, connections, mutexs) {
    console.log("generate diagram")
    console.log(elements);
    console.log(connections);
    console.log(mutexs);
    //var $ = go.GraphObject.make;
    myDiagram =
    $(go.Diagram, "myDiagramDiv",  // must be the ID or reference to div
      {
        initialAutoScale: go.Diagram.UniformToFill,
        layout: $(go.CircularLayout)
      });
    
    myDiagram.isReadOnly = true
    myDiagram.layout.spacing = 25



    const nodeTemplmap = new go.Map(); // In TypeScript you could write: new go.Map<string, go.Node>();
    // for each of the node categories, specify which template to use
    nodeTemplmap.add("activity", activityTemplate);
    nodeTemplmap.add("mutex", mutexTemplate);
    nodeTemplmap.add("start", startTemplate);

    myDiagram.nodeTemplateMap = nodeTemplmap

    const linkTemplmap = new go.Map()
    linkTemplmap.add("arrow", arrowTemplate)
    linkTemplmap.add("noarrow", noarrowTemplate)
    linkTemplmap.add("sameTask", sameTaskArrowTemplate)
    linkTemplmap.add("mutex", mutexLinkTemplate)
    linkTemplmap.add("start", startLinkTemplate)

    myDiagram.linkTemplateMap = linkTemplmap

    myDiagram.nodeTemplateMap.add("LinkLabel",
        $("Node",
          {
            selectable: false, avoidable: false,
            layerName: "Foreground"
          },  // always have link label nodes in front of Links
          $("Shape", "Ellipse",
            {
              width: 5, height: 5, stroke: null,
              portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
            })
        ));

    var arr = [];
    let con = [];


    elements.forEach(element => {
        console.log(element);
        if (element.isActive) {
            arr.push({ key: element.id, name: element.name, task: element.ofTask.name, color: "red", category: "activity"})
        }
        else {
            arr.push({ key: element.id, name: element.name, task: element.ofTask.name, category: "activity"})
        }
    });

    mutexs.forEach(mutex => {
        console.log("M: ");
        console.log(mutex);
        arr.push({ key: mutex.id, name: mutex.name, category: "mutex" })
        mutex.activities.forEach(activity => {
            con.push({ from: mutex.id, to: activity.id, category: "mutex" })
        });
    });

    connections.forEach((semaphore) => {
        if (!semaphore.isMutexSemaphore()) {
            if (semaphore.fromActivity.ofTaskId == semaphore.toActivity.ofTaskId) {
                // gleicher Task
                con.push({labelKeys: [semaphore.id], from: semaphore.fromActivity.id, to: semaphore.toActivity.id, category: "sameTask" })
                console.log("Added same Task");
            } else {
                // verschiedener Task
                con.push({labelKeys: [semaphore.id], from: semaphore.fromActivity.id, to: semaphore.toActivity.id, category: "arrow", value: semaphore.value, name: semaphore.name })
                console.log("Added not same Task");
            }
            console.log("CON: " + semaphore.initValue);
        }
    })

    starts.forEach(start => {
        console.log("S: ");
        console.log(start);
        arr.push({ key: start.id, name: start.name, category: "start"})
        arr.push({ key: start.startSemaphore.id, category: "LinkLabel"})
        con.push({ from: start.id, to: start.startSemaphore.id, category: "start"})
    })

    console.log("[CONNECTIONS:]")
    con.forEach((connection) => {
        console.log(connection);
    })


    myDiagram.model = new go.GraphLinksModel(arr, con, {linkLabelKeysProperty: "labelKeys"})
}

function clearDiagram(diagram) {
    diagram.div = null
}

function updateDiagram() {
    generateDiagram(Starts, Activities, Semaphores, Mutexs);
}

function increaseTactText() {
    aktuellerTakt += 1
    document.getElementById("aktueller-takt").innerText = aktuellerTakt
}

let minVal = 0;

function nextStep() {
    clearDiagram(myDiagram)
    increaseTactText()

    Activities.forEach(activity => {
        if (activity.canExecute()) {
            console.log("Performing Action on: ", activity);
            activity.executeOneTact()
        } else {
            console.log("Not executable: ", activity);
        }
    })

    updateDiagram()
}

function _nextStep() {
    console.log("next step")

    // Clear Diagram before redrawing
    myDiagram.div = null

    // erster Move
    if (Running.length == 0) {
        Starts.forEach(start => {
            let startActivity = start.startSemaphore.toActivity
            
            

            console.log("Starting at: ", startActivity);
            startActivity.isActive = true
            
            Running.push(startActivity)

            /* startActivity.semaphoresTo.forEach(sempahoreTo => {
                sempahoreTo.freigeben()
            }) */
        })
        
        //let startActivity = Activities.find(activity => activity.id == startActivityId)
        
        generateDiagram(Starts, Activities, Semaphores, Mutexs);
    }
    // alle anderen Moves
    else {
        // Copy Running Array, so that the changes are not made while looping threw
        var tempRunning = []


        Running.forEach(runningActivity => {
            console.log("Running Activity: ", runningActivity);
            console.log("Possible next Activities: ", runningActivity.semaphoresTo);
            let nextActivityId = runningActivity.semaphoresTo[Math.floor(Math.random() * runningActivity.semaphoresTo.length)].toActivity.id

            let nextActivity = Activities.find(activity => activity.id == nextActivityId)
            // Wenn Activity mit Mutex verbunden ist
            if (nextActivity.semaphoresFrom.some(semaphore => semaphore.isMutexSemaphore())) {
                let mutexId = nextActivity.semaphoresFrom.find(semaphore => semaphore.isMutexSemaphore()).fromActivity.id
                let mutex = Mutexs.find(mutex => mutex.id == mutexId)
                if (!mutex.isBlocked) {
                    // Block Input Semaphores
                    nextActivity.semaphoresFrom.forEach(sempahoreFrom => {
                        sempahoreFrom.sperren()
                    })

                    runningActivity.isActive = false
                    nextActivity.isActive = true
                    //Running.pop(runningActivity)
                    //Running.push(nextActivity)
                    //runningActivity = nextActivity
                    tempRunning.push(nextActivity)
                    console.log("New Running Activity: ", nextActivity);

                    nextActivity.semaphoresFrom.forEach(semaphoresFrom => {
                        semaphoresFrom.freigeben()
                    })
                }
                else {

                }
            }
            else {
                if (nextActivity.semaphoresFrom.some(semaphore => semaphore.value > 0)) {

                    nextActivity.semaphoresFrom.forEach(sempahoreFrom => {
                        sempahoreFrom.sperren()
                    })
                    
                    console.log("ELSE");
                    runningActivity.isActive = false
                    nextActivity.isActive = true
                    //Running.pop(runningActivity)
                    //Running.push(nextActivity)
                    //runningActivity = nextActivity
                    tempRunning.push(nextActivity)
                    console.log("New Running Activity: ", nextActivity);

                    nextActivity.semaphoresFrom.forEach(semaphoresFrom => {
                        semaphoresFrom.freigeben()
                    })
                    
                }
                else {
                    console.log("Kann nicht weiter");
                }

            }


        })
        Running = tempRunning


        generateDiagram(Starts, Activities, Semaphores, Mutexs);
    }
}

// Wird durch das File-input Feld getriggert. Stellt die csv-Datei als "csvFile" zur Verfügung
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
    //generateDiagram(Starts, Activities, Semaphores, Mutexs)
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
            Semaphores.push(new Semaphore(id, name, parseInt(rowCol[7]), null, rowCol[5], rowCol[6]))
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
                    activity.ofTask = task
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
                if (activity.semaphoresFrom.some(e => e.fromActivity == id) || activity.semaphoresTo.some(e => e.toActivity.id == id)) {
                    mutex.activities.push(activity)
                    activity.mutexes.push(mutex)
                    console.log("MA: pushed " + activity.name);
                }
            })
            Mutexs.push(mutex)
            console.log("[MUTEX] added: " + name);
        }
    })

    // Starts
    rows.forEach((zeile) => {
        let zelle = zeile.split(SEPARATOR)
        let type = zelle[1], id = zelle[0], name = zelle[2], startSemaphore = zelle[3]
        if(type == 0) {
            let start = new Start(id, name)
            Semaphores.forEach((semaphore) => {
                if (semaphore.id == startSemaphore) {
                    start.startSemaphore = semaphore
                    semaphore.value = 1
                }
            })
            Starts.push(start)
            console.log("[STARTS]: added Start: " + start.name);
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
        // Id durch Semaphoren Objekt ersetzen
        if (semaphore.isMutexSemaphore()) {
            semaphore.fromActivity = Mutexs.find(mutex => mutex.id == semaphore.fromActivity)
            //semaphore.toActivity = Semaphores.find(semaphore => semaphore.id == semaphore.toActivity)
        }
        else {
            semaphore.fromActivity = Activities.find(activity => activity.id == semaphore.fromActivity)
            
        }
        semaphore.toActivity = Activities.find(activity => activity.id == semaphore.toActivity)
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

        ids.push(rowColData[0])

        // Loop on the row column Array
        for (var col = 0; col < rowColData.length; col++) {

            // Insert a cell at the end of the row
            var newCell = newRow.insertCell();
            newCell.innerHTML = rowColData[col];

        }

    }
}
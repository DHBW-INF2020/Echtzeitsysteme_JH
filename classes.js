class Task {
    constructor(id, name, activities) {
        this.id = id
        this.name = name
        this.activities = activities = []
    }
}

class Activity {
    constructor(id, name, tacts, semaphoresFrom, semaphoresTo, mutexes, ofTaskId) {
        this.id = id
        this.name = name
        this.tacts = tacts
        this.tactsDone = 0
        this.semaphoresFrom = semaphoresFrom = []
        this.semaphoresTo = semaphoresTo = []
        this.mutexes = mutexes = []
        this.ofTaskId = ofTaskId
        this.ofTask

        this.isActive = false
    }

    // Check if there is an incoming semaphore with value 0
    // If so, canExecute returns false
    canExecute() {
        if (this.hasMutex()) {
            console.log("HAS MUTEX AND MUTEX NOT BLOCKED: ", this);
            return (!this.semaphoresFrom.some(semaphore => semaphore.value == 0) || (this.isActive)) && (!this.mutexes.some(mutex => mutex.isBlocked) || this.mutexes.some(mutex => mutex.blockedBy == this))
        } else {
            return !this.semaphoresFrom.some(semaphore => semaphore.value == 0) || (this.isActive)
        }
    }

    executeOneTact() {
        if (this.tactsDone == 0) {
            this.blockSemaphores()
            if (this.hasMutex) {
                this.mutexes.forEach(mutex => {
                    //mutexesInUse.push(mutex)
                    mutex.sperren(this)
                })
            }
        }
        if (this.tactsDone < this.tacts) {
            this.isActive = true
            this.tactsDone++
            console.log("Performed one tact");
            return false
        } else {
            this.releaseSemaphores()
            this.tactsDone = 0
            this.isActive = false
            this.semaphoresTo.forEach(semaphoreTo => {
                semaphoreTo.freigeben()
            })
            if (this.mutexes.some(mutex => mutex.isBlocked)) {
                this.mutexes.forEach(mutex => {
                    mutex.freigeben()
                })
            }
            return true
        }
    }
    blockSemaphores() {
        this.semaphoresFrom.forEach(semaphore => {
            if (semaphore.value != -1) {
                semaphore.sperren()
                console.log("Blocked Semaphores");
            }
            
        })
    }
    releaseSemaphores() {
        this.semaphoresFrom.forEach(semaphore => {
            if (semaphore.value != -1) {
                semaphore.freigeben()
                console.log("Released Semaphores");
            }
            
        })
    }

    hasMutex() {
        return this.semaphoresFrom.some(semaphore => semaphore.initValue == -1)
    }
}

class Semaphore {
    constructor(id, name, initValue, value, fromActivity, toActivity) {
        this.id = id
        this.name = name
        this.initValue = initValue
        this.value = initValue
        this.fromActivity = fromActivity
        this.toActivity = toActivity
    }

    sperren() {
        if (this.value >= 1) {
            this.value -= 1
        } else {
            console.log(this.name + " bereits bei 0");
        }
        
        console.log(this.name + " gesperrt");
    }

    freigeben() {
        this.value += 1
        console.log(this.name + " freigegeben");
    }

    isMutexSemaphore() {
        return (this.initValue == -1)
    }
}

class Mutex {
    constructor(id, name, activities) {
        this.id = id
        this.name = name
        this.activities = activities = []
        this.value = 1 // Mutex immer mit 1 initialisieren
        this.isBlocked = false
        this.blockedBy = null
    }

    sperren(activity) {
        this.value -= 1
        this.isBlocked = true
        this.blockedBy = activity
    }

    freigeben() {
        this.value += 1
        this.isBlocked = false
        this.blockedBy = null
    }
}

class Start {
    constructor(id, name, startSemaphore) {
        this.id = id
        this.name = name
        this.startSemaphore = startSemaphore
    }
}
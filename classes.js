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
        this.semaphoresFrom = semaphoresFrom = []
        this.semaphoresTo = semaphoresTo = []
        this.mutexes = mutexes
        this.ofTaskId = ofTaskId

        this.isActive = false
    }
}

class Semaphore {
    constructor(id, name, initValue, state, fromActivity, toActivity) {
        this.id = id
        this.name = name
        this.initValue = initValue
        this.state = state
        this.fromActivity = fromActivity
        this.toActivity = toActivity
    }
}

class Mutex {
    constructor(id, name, activities) {
        this.id = id
        this.name = name
        this.activities = activities = []
    }
}
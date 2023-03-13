class Task {
    constructor(id, name, activities) {
        this.id = id
        this.name = name
        this.activities = activities
    }
}

class Activity {
    constructor(id, name, tacts, semaphoresFrom, semaphoresTo, mutexes) {
        this.id = id
        this.name = name
        this.tacts = tacts
        this.semaphoresFrom = semaphoresFrom
        this.semaphoresTo = semaphoresTo
        this.mutexes = mutexes

        this.isActive = false
    }
}

class Semaphore {
    constructor(id, name, initvalue, state, fromActivity, toActivity) {
        this.id = id
        this.name = name
        this.initvalue = initvalue
        this.state = state
        this.fromActivity = fromActivity
        this.toActivity = toActivity
    }
}

class Mutex {
    constructor(id, name, activities) {
        this.id = id
        this.name = name
        this.activities = activities
    }
}

class dbGetter{
    static alreadyData = {};

    static async getOnce(reference, path, defaultTo = undefined){
        console.log('importing once', path)
        const snapshot = await reference.child(path).get();
        if (snapshot.exists()) return snapshot.val();
        else return defaultTo;
    }

    static async getPersistent(reference, path, defaultTo = undefined){
        if (this.alreadyData[path]) return this.alreadyData[path]
        else {
            console.log('importing', path, 'for the first time')
            const snapshot = await reference.child(path).get();
            if (snapshot.exists()) {
                this.alreadyData[path] = snapshot.val();
                return snapshot.val();
            } else return defaultTo;
        }
    }
}

module.exports = { dbGetter }
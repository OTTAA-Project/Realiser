
class dbGetter{
    static alreadyData = {};

    static async getOnce(reference, path, defaultTo = undefined){
        const snapshot = await reference.child(path).get();
        if (snapshot.exists()) return snapshot.val();
        else return defaultTo;
    }

    static async getPersistent(reference, path, defaultTo = undefined){
        if (this.alreadyData[path]) return this.alreadyData[path]
        else {
            const snapshot = await reference.child(path).get();
            if (snapshot.exists()) {
                this.alreadyData[path] = snapshot.val();
                return snapshot.val();
            } else return defaultTo;
        }
    }
}

module.exports = { dbGetter }
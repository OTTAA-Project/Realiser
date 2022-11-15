const admin = require('firebase-admin');
const serviceAccount = require('./ottaaproject-flutter-firebase-adminsdk-z2x83-b744263584.json');

function getApp () {
    try{
        return admin.app('realiser')
    } catch (e){
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://ottaaproject-realiser-lexicons.firebaseio.com/",
        }, 'realiser');
        return admin.app('realiser')
    }
}

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

module.exports = { dbGetter, getApp }
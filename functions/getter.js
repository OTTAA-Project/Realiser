const admin = require('firebase-admin');
const { readFileSync } = require('fs');

const serviceAccount = JSON.parse(readFileSync(`${process.env.SERVICE_ACCOUNT}`, {encoding: 'utf-8'}))

function getApp () {
    try{
        return admin.app('realiser')
    } catch (e){
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `${process.env.DATABASE_URL}`
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
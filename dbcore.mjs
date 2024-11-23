import Database from 'better-sqlite3';

class DBHandler {
    constructor(dbFile) {
        this.dbFile = dbFile;
        this.db = new Database(dbFile);
    }

    async getDatabase(){
        return this.db;
    }

    async insertQuery(query, values){
        const stmt = this.db.prepare(query);
        const result = stmt.run(...values);
        return result;
    }

    async selectQuery(query, values){
        const slctquery = this.db.prepare(query);
        const result = slctquery.all();
        return result;
    }

}

export default DBHandler;
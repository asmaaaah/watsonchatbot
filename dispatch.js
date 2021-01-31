var ibmdb = require('ibm_db');


// Retrieve event information by searching the shortname
 function fetchInfoByName(dsn, fullname) {
    try {
       var conn=ibmdb.openSync(dsn);
       // Search for exact match only, could be extended with lIKE
       var data=conn.querySync("select fullname, information from infotable where shortname=?", [fullname]);
       conn.closeSync();
       var resString="";
       for (var i=0;i<data.length;i++) {
         resString+="Information: "+data[i]['INFORMATION']+" \n";
       }
       // Return both generated string and data
       return {result : resString, data : data, input: eventname};
    } catch (e) {
        return { dberror : e }
    }
   }
   

// Retrieve event information by searching the dates
 function fetchNames(dsn) {
    try {
       var conn=ibmdb.openSync(dsn);
       // Base data is timestamp
       var data=conn.querySync("select fullname from infotable");
       conn.closeSync();
       var resString="Data: \n";
       for (var i=0;i<data.length;i++) {
         resString+="name: "+data[i]['SHORTNAME']+" \n"
       }
       // Return both generated string and data
       return {result: resString, data: data, input: eventdates};
    } catch (e) {
        return { dberror : e }
    }
   }

// Insert a new event record
 function insertInfo(dsn, eventValues) {
    try {
       var conn=ibmdb.openSync(dsn);
       // The timestamp value is derived from date and time values passed in
       var data=conn.querySync("insert into infotable(fullname, information) values(?,?)", eventValues);
       conn.closeSync();
       return {result: data, input: eventValues};
    } catch (e) {
        return { dberror : e }
    }
   }
   

function main(params) {
    dsn=params.__bx_creds[Object.keys(params.__bx_creds)[0]].dsn;

    // dsn does not exist in the DB2 credential for Standard instance. It must be built manually
    if(!dsn) {
        const dbname = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.database;
        const hostname = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.hosts[0].hostname;
        const port = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.hosts[0].port;
        const protocol = 'TCPIP';
        const uid = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.authentication.username;
        const password = params.__bx_creds[Object.keys(params.__bx_creds)[0]].connection.db2.authentication.password;
        
        //dsn="DATABASE=;HOSTNAME=;PORT=;PROTOCOL=;UID=;PWD=;Security=SSL";
        dsn = `DATABASE=${dbname};HOSTNAME=${hostname};PORT=${port};PROTOCOL=${protocol};UID=${uid};PWD=${password};Security=SSL`;
    }
    
    switch(params.actionname) {
        case "insert":
            return insertInfo(dsn,params.eventValues.split(","));
        case "searchByDates":
            return fetchNames(dsn);
        case "searchByName":
            return fetchInfoByName(dsn,params.eventname);
        default:
            return { dberror: "No action defined", actionname: params.actionname}
    }
}

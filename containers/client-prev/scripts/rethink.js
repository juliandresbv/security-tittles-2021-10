require('dotenv').config()

const r = require('rethinkdb');

console.log(process.env.RETHINK_HOST, process.env.RETHINK_PORT);

let a = r.connect({
  host: process.env.RETHINK_HOST,
  port: process.env.RETHINK_PORT,
  password: process.env.RETHINK_PASSWORD,
  user: process.env.RETHINK_USER
}).then(async (conn)=>{
    await r.dbList().run(conn).then((tables) => {
        console.log("Tables:", tables);
    })

    try{
      await r.dbCreate('it_works').run(conn);
    }
    catch( e ){
      //Do nothing
    }

    await conn.close()
});



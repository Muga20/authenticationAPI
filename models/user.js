import db from "../config/config.js";
import  Sequelize  from "sequelize";


const User = db.define('user', {
    name: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
   
    email: {  
        type: Sequelize.STRING  
    },

    password:{
         type:Sequelize.STRING
    }

},{
    freezeTableName: true
});


db.sync()
.then(()=>{
    console.log(' Users table created');

})

export default User 


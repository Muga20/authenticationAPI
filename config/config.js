import  sequelize  from "sequelize";


const db = new sequelize( 'authentication', 'root', '' , {
    host: "localhost",
    dialect: "mysql"
});

export default db
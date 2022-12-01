import express from "express"; 

import { 
    getAllUser,
    createUser,
    getUserById,
    logInUser,
    updateUser ,
    deleteUser
  
} from "../controllers/user.js";
 
const UserRoutes = express.Router();
 
UserRoutes.get('/', getAllUser);
UserRoutes.post('/', createUser);
UserRoutes.post('/login', logInUser);
UserRoutes.get('/:id' ,getUserById);
UserRoutes.put('/:id', updateUser);
UserRoutes.delete('/:id', deleteUser);

 
export default UserRoutes;
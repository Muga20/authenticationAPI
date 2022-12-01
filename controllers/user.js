import User from "../models/user.js";
import dotenv from 'dotenv';
//get config vars
    dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const createToken = (id) => {
 return jwt.sign({id},process.env.TOKEN_SECRET,{expiresIn:'2d'})
}


export const getAllUser = async (req, res) => {
  try {
    const listAllUser = await User.findAll();
    res.json(listAllUser);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const getAllById = await User.findAll({
      where: {
        id: req.params.id,
      },
    });
    res.json(getAllById[0]);
  } catch (error) {
    res.json({ message: error.message });
  }
};



export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const UserEmail = await User.findOne({ where: { email: email } });

  if(UserEmail){
        //  res.send("User Email Exist")
       return res.sendStatus(401)
  }else{

  const salt = await bcrypt.genSalt(10);
  bcrypt.hash(password, salt).then((hash) => {
    try {
        User.create({
        name: name,
        email: email,
        password: hash,
      
      });
      const token = createToken(
        User.id
      )
      res.json({
          email,token
        // message: "User Successfully created",
      });
    } catch (err) {
      if (err) {
        res.status(400).json({ error: err });
      }
    }
  });
}
};

export const logInUser = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email } });

   if (!user)  return res.sendStatus(400);
   

  const dbPassword = user.password;

  const token = createToken(
    User.id
  )

  bcrypt.compare(password, dbPassword).then((match) => {
    if (!match) {
       return res.sendStatus(401)
      // res 
      //   .json({ error: "Wrong Username and Password Combination!" });
     //   console.log("logInMembers");
    } else {

      const token = createToken(User.id)
      res.status(200).json({ email, password, token })
    }
  });
};


export const updateUser = async (req, res) => {
  try {
    await User.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.json({
      message: "User Successfully Updated",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.json({
      message: "User Successfully Deleted",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};
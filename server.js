const express = require('express');
const bcrypt = require('bcrypt-nodejs');
require('dotenv').config()
const cors = require('cors');
const Register = require('./controllers/register');
const Signin = require('./controllers/signin');
const Profile = require('./controllers/profile');
const Image = require('./controllers/image');
const Clarifai = require('clarifai');

//using knex as query builder to pg
var db = require('knex')({
    client: 'pg',
    connection: JSON.parse(process.env.PG_CONNECTION_STRING),
  });


const app = express();
const PORT = process.env.PORT;
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;


const clarifai_app = new Clarifai.App({
    apiKey: CLARIFAI_API_KEY
   });

//parse the body data to json
app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{
    console.log('Incoming message')
    res.json('Hello there, Welcome home!')
})

app.listen(PORT, ()=>{
    console.log(`app is running on PORT ${PORT}`)
});

/*
Sign-in route
gets email & password
uses bcrypt to compare the password hash on Login table
 */
app.post('/signin',(req,res)=>{Signin.handleSignin(req,res,db,bcrypt)});


app.post('/register',(req,res)=>{Register.handleRegister(req,res,db,bcrypt)});

/*
Profile route provides details about the user
*/
app.get('/profile/:id',(req,res)=>{Profile.handleProfile(res,req,db)})

/*
image-entries - is used to increment the entries made by user
*/
app.put('/image-entries', (req,res)=>{Image.handleImageEntries(req,res,db)});

/*
imageRecognition - is used to recognize faces using ClarifAI
*/
app.post('/imageRecognition', (req,res)=>{Image.handleImageRecognition(req,res,clarifai_app,Clarifai)});
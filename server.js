const express = require('express');
const bcrypt = require('bcrypt-nodejs');
require('dotenv').config()
const cors = require('cors');

//using knex as query builder to pg
var db = require('knex')({
    client: 'pg',
    connection: JSON.parse(process.env.PG_CONNECTION_STRING),
  });


const app = express();
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
const port = process.env.port;

//parse the body data to json
app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{
    console.log('Incoming message')
    res.json('Hello there, Welcome home!')
})

app.listen(port, ()=>{
    console.log(`app is running on port ${port}`)
});

/*
Sign-in route
gets email & password
uses bcrypt to compare the password hash on Login table
 */
app.post('/signin',(req,res)=>{
    // console.log('sign-in',req.body);
    const {email,password} = req.body;

    (async () =>{
        //check if user already exists.
        const loginInfo = await db('login')
        .where({email:email})
        .first()
        .then((row)=>row);

        //when user's email exists
        if(loginInfo !== undefined){
            //uses bcrypt to compare the password hash on Login table
            const isHashValid = bcrypt.compareSync(password, loginInfo.hash);
            if (isHashValid){

                //get user's info.
                const usersInfo = await db('users')
                .where({email:email})
                .first()
                .then((row)=>row);                
                if (usersInfo !== undefined)
                {
                    res.json(
                    {
                        status:"success",
                        user:{                    
                            email:usersInfo.email,
                            id:usersInfo.id,
                            name:usersInfo.name,
                            entries:usersInfo.entries,
                            joined:usersInfo.joined,
                        },
                        // CLIENT_ID:process.env.CLIENT_ID,
                        CLARIFAI_API_KEY:CLARIFAI_API_KEY,
                    });
                }else{
                    res.status(400).json({status:"failure",message:'error during sign-in, please check inputs'}); 
                }
            }else{
                res.status(400).json({status:"failure",message:'error during sign-in, please check inputs'}); 
            }
        } else{
            res.status(400).json({status:"failure",message:'error during sign-in, please check inputs'}); 
        }        
    })();
})


app.post('/register',(req,res)=>{
    try{        
        const {email,password,name} = req.body;
        const hash = bcrypt.hashSync(password);
        db.transaction( async trx => {
            
                //check if user already exists.
                const userfromDB = await db('users')
                .where({email:email})
                .first()
                .then((row)=>row);

                //add the user,if not present
                if(userfromDB === undefined)
                {
                    await trx('login')
                        .insert({
                            email,
                            hash
                        })
                        // .returning('*')
                        // .then(login=>{
                        //     console.log('1 login data', login)
                        // })
                        .catch(err=>console.log('error login',err))

                    await trx('users')
                    .insert({
                        name: name,
                        email: email,
                    })
                    .returning('*') //this returns inserted record
                    .then(user=>{
                        // console.log('2 user data', user);                        
                        res.json({status:"success",message:'success'});
                    })
                    .catch(err=>{
                        res.json({status:"failure",message:'error: unable to register'});
                        // console.log('error users',err);
                    });

                }else{
                    res.json({status:"failure",message:'email already exists'});
                }

        })

    }catch{ 
        err=>{
            // console.log('error', err);
            res.json({status:"failure",message:'error: unable to register'});
        }
    }
})

/*
Profile route provides details about the user
*/
app.get('/profile/:id',(req,res)=>{
    const {id} = req.params;

    (async ()=>{
            // console.log('typeof id', typeof(id));   
            //type coercion is fine here 
            const userInfo = await db('users')
                                    .where({id})
                                    .first()
                                    .then((row)=>row);
            // console.log(userInfo);
            if(userInfo !== undefined){
                res.json(
                    {
                        email:userInfo.email,
                        id:userInfo.id,
                        name:userInfo.name,
                        entries:userInfo.entries,
                        joined:userInfo.joined,
                    }
                );
            }else{        
                res.json('not found');
            }

    })();
})

/*
image-entries - is used to increment the entries made by user
*/
app.put('/image-entries',(req,res)=>{
    const {id} = req.body;

    db('users')
        .where({id})
        .increment('entries',1)
        .returning('entries')
        .then(entries=>{
            console.log(`data id ${id} entries ${entries}`);            
            res.json(
                {
                    status:"success",
                    user:{                    
                        id,
                        entries:entries[0], //select on knex always returns an array
                    }
                }
            );
        })
        .catch(err=> res.status(400).json({status:"failure",message:'error getting entries'}))
})


/*
This is for later use, route would return clarifaiKey
currently, info is shared when user successfully log-in
*/
app.post('/clarifaiKey/',(req,res)=>{
    const {clientid} = req.body;
    //if clientid exists
    res.json({key:'abc'})
})
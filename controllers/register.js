

const handleRegister= (req,res,db,bcrypt)=> {
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
}

module.exports={
    handleRegister:handleRegister
}
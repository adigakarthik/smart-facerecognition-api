const handleSignin= (req,res,db,bcrypt,CLARIFAI_API_KEY)=>{
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
}

module.exports ={
    handleSignin: handleSignin
}
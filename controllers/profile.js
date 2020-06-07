const handleProfile =(res,req,db)=>{
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
}

module.exports ={
    handleProfile:handleProfile
}
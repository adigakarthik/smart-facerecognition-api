const handleImageEntries= (req,res,db)=>{
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
}

module.exports ={
    handleImageEntries:handleImageEntries
}
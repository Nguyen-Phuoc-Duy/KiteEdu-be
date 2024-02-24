const Tables = require("../models/tables");


const TalbeController = {
    createTable: async (req,res) => {
        let { name } = req.body,
        { user } = req;

        if (!name) return res.json({ errCode: 401, errMsg: 'Invalid params!' });

        let newTable = await Tables.create({
            name, createdBy: user.ID
        }, { returning: true });


        return res.json({
            errCode: 200,
            data: newTable,
        });
    },
    getAll: async (req, res) => {
        try {
            let listTables = await Tables.findAll({ where: {
                isDeleted: false
            }, order: [['createdAt', 'DESC']] })
            return res.json({
                errCode: 200,
                errMsg: 'Success',
                data: listTables
            })
        } catch(err) {
            console.log(err);
            return res.json({
                errCode: 500,
                errMsg: 'System error!',
            })
        }
    },
    updateTable: async (req, res) => {
        try {
            let { ID, name } = req.body;

            if (!ID || !name) return res.json({ errCode: 401, errMsg: 'Invalid params!' });
            const tableUpdated = await Tables.update({ name }, { where: { ID } });
            if (tableUpdated?.[0]){
                return res.json({ errCode: 200, errMsg: 'Updated successfully!' });
            }else {
                return res.json({ errCode: 401, errMsg: 'Table not found!' });
            }

        } catch(err) {
            console.log(err);
            return res.json({
                errCode: 500,
                errMsg: 'System error!',
            })
        }
    },
    deleteTable: async (req, res) => {
        try {
            let { ID } = req.params;

            if (!ID) return res.json({ errCode: 401, errMsg: 'Table not found!' });

            await Tables.update({ isDeleted: true },{ where: { ID } });
            return res.json({ errCode: 200, errMsg: 'Table delete successfully!' });

        } catch(err) {
            console.log(err);
            return res.json({
                errCode: 500,
                errMsg: 'System error!',
            })
        }
    }
}

module.exports = TalbeController;
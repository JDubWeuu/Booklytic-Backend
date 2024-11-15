const sequelize = require('../database/database');
const adminAuth = require('../firebase/admin');

const validate = async (req, res, next) => {
    const idToken = req.cookies['accessToken'] || "";
    try {
        // check if the id token stored in cookies is still valid, if not then 
        const userDecoded = await adminAuth.verifyIdToken(idToken);
        
        let query = `SELECT * FROM "user" WHERE "user".google_uid = :uid`;

        const [user, metadata] = await sequelize.query(query, {
            replacements: {
                uid: userDecoded.sub
            }
        });

        console.log(user);
        
        req.user = {...user};
        next();
    }
    catch (error) {
        // within front end, catch this error and update loggedIn state and then redirect to the login page
        res.status(500).json({
            error: "Unable to verify user id token",
            details: error.message
        })
    }
}

module.exports = {
    validate
}
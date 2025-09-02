const db = require("../config/db");

const loginController = async (req, res) => {
    try {
        const { admin_id, password } = req.body;
        if (!admin_id || !password) {
            return res.status(400).send({
                success: false,
                message: "Admin ID and password are required"
            });
        }

        const [rows] = await db.query('SELECT * FROM admin WHERE admin_id = ? AND password = ?', [admin_id, password]);

        if (rows.length > 0) {
            req.session.user = rows[0];
            res.status(200).send({
                success: true,
                message: "Login successful"
            });
        } else {
            res.status(401).send({
                success: false,
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in login process",
            error
        });
    }
};

module.exports = { loginController };

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: "Acesso negado. Onde ta o token porra?"})
    }

    try {
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Formato token inválido"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch(error) {
        res.status(401).json({ message: "Token inválido. "});
    }
    
};

module.exports = auth;

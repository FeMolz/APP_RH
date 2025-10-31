export const isAdmin = (req, res, next) => {
    try {
        if (req.user && req.user.role === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({
                message: "Acesso negado. Rota restrita"
            });
        }
        
    } catch(error) {
        return res.status(500).json({
            message: "Erro Interno"
        });
    }
};
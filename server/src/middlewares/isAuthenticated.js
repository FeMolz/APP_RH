import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {

  const authHeader = req.headers.authorization; 

  if (!authHeader) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  try {

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Formato de token inválido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

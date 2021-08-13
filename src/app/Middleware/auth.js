import { verify } from "jsonwebtoken";

import authConfig from "../../config/auth";

export const AuthMiddleware = async (req, res, next) => {
  // Pegando o token.
  const authHeader = req.headers.authorization;

  // verificando se o token foi enviando.
  if (!authHeader) {
    return res.status(401).json({ error: "Token not provided" });
  }

  // para retirar o "bearer" do token
  const [, token] = authHeader.split(" ");

  try {
    const { id } = await verify(token, authConfig.secret);

    req.userId = id;

    return next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }

  return next();
};

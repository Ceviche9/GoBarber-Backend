import multer from "multer";
import crypto from "crypto";
import { extname, resolve } from "path";

export default {
  storage: multer.diskStorage({
    // local onde a imagem ficará armazenada.
    destination: resolve(__dirname, "..", "..", "tmp", "uploads"),
    filename: (req, file, cb) => {
      // função para mudar o nome do arquivo.
      crypto.randomBytes(10, (err, res) => {
        // o cb (callback) recebe algum erro caso exista.
        if (err) return cb(err);

        // O primeiro parâmetro do cb é o erro.
        // O segundo parâmetro é o nome da imagem.
        return cb(null, res.toString("hex") + extname(file.originalname));
      });
    },
  }),
};

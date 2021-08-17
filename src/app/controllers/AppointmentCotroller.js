import Appointment from "../models/Appointments";
import * as Yup from "yup";
import User from "../models/User";

// Controller responsável para fazer o agendamento com algum barbeiro.
class AppointmentController {
  async store(req, res) {
    // Para validar o dados enviados.
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    // Verificando se os dados enviados estão corretos.
    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: "Validation fail " });
    }

    try {
      const { provider_id, date } = req.body;

      // Verificando se o provider_id é um provider.
      const isProvider = await User.findOne({
        where: { id: provider_id, provider: true },
      });

      // Caso o id enviado não seja de um provider.
      if (!isProvider) {
        return res
          .status(401)
          .json({ error: "You can only create appointments with providers" });
      }

      // Armazenando os dados no banco.
      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date,
      });

      return res.json(appointment);
    } catch (e) {
      console.log(e);
      return res.json({ error: "ERROR" });
    }
  }
}

export { AppointmentController };

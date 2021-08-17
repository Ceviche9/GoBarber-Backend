import * as Yup from "yup";
import { startOfHour, parseISO, isBefore } from "date-fns";
import Appointment from "../models/Appointments";
import User from "../models/User";
import File from "../models/Files";

// Controller responsável para fazer o agendamento com algum barbeiro.
class AppointmentController {
  // Para listar todos os agendamentos do usuário
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ["date"],
      attributes: ["id", "date"],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["id", "name"],
          include: [
            {
              model: File,
              as: "avatar",
              attributes: ["id", "path", "url"],
            },
          ],
        },
      ],
    });

    return res.json(appointment);
  }

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

      const hourStart = startOfHour(parseISO(date));

      // Verificando se a data enviada já passou.
      if (isBefore(hourStart, new Date())) {
        return res.status(400).json({ error: "Past dates are not permitted" });
      }

      // Verificando se a data enviada está disponível
      const checkAvailability = await Appointment.findOne({
        where: {
          provider_id,
          canceled_at: null,
          date: hourStart,
        },
      });

      if (checkAvailability) {
        return res
          .status(400)
          .json({ error: "Appointment date is not available" });
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

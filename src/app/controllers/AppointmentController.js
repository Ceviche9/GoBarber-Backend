import * as Yup from "yup";
import { startOfHour, parseISO, isAfter, format } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import Appointment from "../models/Appointments";
import User from "../models/User";
import File from "../models/Files";
import Notification from "../models/Notifications";

// Controller responsável para fazer o agendamento com algum barbeiro.
class AppointmentController {
  // Para listar todos os agendamentos do usuário
  async index(req, res) {
    const { page = 1 } = req.query;

    // Para listar os appointments armazenados no banco.
    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      // ordenando por data.
      order: ["date"],
      // Escolhendo os atributos.
      attributes: ["id", "date"],
      // limitando o numero de agendamentos por pagina.
      limit: 20,
      // lógica de paginação.
      offset: (page - 1) * 20,
      // incluindo as informações do barbeiro(provider).
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

      if (req.userId === provider_id) {
        return res.status(401).json({
          error: "You cant make a appointment with yourself",
        });
      }

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

      // Formatando a data.
      const parsedDate = parseISO(date);
      // Ajustando o fuso.
      const znDate = zonedTimeToUtc(parsedDate, "America/Brasilia");
      // Pegando apenas a hora.
      const hourStart = startOfHour(znDate);

      // Verificando se a data enviada já passou.
      if (!isAfter(znDate, new Date())) {
        return res.status(400).json({ error: "Past dates are not permitted" });
      }

      // Verificando se a data enviada está disponível
      const checkAvailability = await Appointment.findOne({
        where: {
          provider_id,
          canceled_at: null,
          date: znDate,
        },
      });

      // Verificando a disponibilidade da data escolhida.
      if (checkAvailability) {
        return res
          .status(400)
          .json({ error: "Appointment date is not available" });
      }

      // Pegando os dados do usuário.
      const user = await User.findByPk(req.userId);

      // Para formatar a data.
      const formattedMonth = format(hourStart, "MMMM");
      const formattedDay = format(hourStart, "dd");

      // Armazenando os dados no banco.
      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date: znDate,
      });

      // Criar e armazenar uma notificação para o prestador de serviços.
      const notification = await Notification.create({
        content: `New Appointment: ${user.name}, ${formattedMonth} ${formattedDay}`,
        notification_owner: provider_id,
        read: false,
      });

      // A data mostrada no insomnia está errada porem a data armazenada no banco está correta.
      return res.json(appointment);
    } catch (e) {
      console.log(e);
      return res.json({ error: "ERROR" });
    }
  }
}

export { AppointmentController };

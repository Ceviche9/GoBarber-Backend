import { startOfDay, endOfDay, parseISO } from "date-fns";
import { Op } from "sequelize";
import { zonedTimeToUtc } from "date-fns-tz";

import User from "../models/User";
import Appointment from "../models/Appointments";

class ScheduleController {
  async index(req, res) {
    // Procurando no banco se existe algum prestador de serviços que tenha o mesmo id do usuário que está logado.
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      res.status(401).json({ error: "User is not a provider" });
    }

    // Formato da query -> Ano-Mês-DiaT05:00:00
    const { date } = req.query;

    const parsedDate = parseISO(date);
    const znDate = zonedTimeToUtc(parsedDate, "America/Brasilia");

    // Para encontrar o agendamento.
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        // Para selecionar todos os agendamentos do dia que o barbeiro selecionou.
        date: {
          [Op.between]: [
            startOfDay(znDate, "America/Brasilia"),
            endOfDay(znDate, "America/Brasilia"),
          ],
        },
      },
      order: ["date"],
    });

    return res.json(appointments);
  }
}

export { ScheduleController };

import * as Yup from 'yup';
import {
  startOfHour,
  parseISO,
  isAfter,
  isBefore,
  format,
  subHours,
} from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

import Appointment from '../models/Appointments';
import User from '../models/User';
import File from '../models/Files';
import Notification from '../models/Notifications';

import cancellationMail from '../Jobs/cancellationMail';
import Queue from '../../lib/Queue';

// Controller responsável para fazer o agendamento com algum barbeiro.
class AppointmentController {
  // Para listar todos os agendamentos do usuário
  async index(req, res) {
    const { page = 1 } = req.query;

    try {
      // Para listar os appointments armazenados no banco.
      const appointment = await Appointment.findAll({
        where: { user_id: req.userId, canceled_at: null },
        // ordenando por data.
        order: ['date'],
        // Escolhendo os atributos que serão mostrados.
        attributes: ['id', 'date', 'past', 'cancelable'],
        // limitando o numero de agendamentos por pagina.
        limit: 20,
        // lógica de paginação.
        offset: (page - 1) * 20,
        // incluindo as informações do barbeiro(provider).
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['id', 'name'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          },
        ],
      });

      return res.json(appointment);
    } catch (e) {
      console.log(e);
      return res.json({ error: "Error" });
    }
  }

  async store(req, res) {
    // Para validar o dados enviados.
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    // Verificando se os dados enviados estão corretos.
    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Validation fail ' });
    }

    try {
      const { provider_id, date } = req.body;

      if (req.userId === provider_id) {
        return res.status(401).json({
          error: 'You cant make a appointment with yourself',
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
          .json({ error: 'You can only create appointments with providers' });
      }

      // Formatando a data.
      const parsedDate = parseISO(date);
      // Ajustando o fuso.
      const znDate = zonedTimeToUtc(parsedDate, 'America/Brasilia');
      // Pegando apenas a hora.
      const hourStart = startOfHour(znDate);

      // Verificando se a data enviada já passou.
      if (!isAfter(znDate, new Date())) {
        return res.status(400).json({ error: 'Past dates are not permitted' });
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
          .json({ error: 'Appointment date is not available' });
      }

      // Pegando os dados do usuário.
      const user = await User.findByPk(req.userId);

      // Para formatar a data.
      const formattedMonth = format(hourStart, 'MMMM');
      const formattedDay = format(hourStart, 'dd');

      // Armazenando os dados no banco.
      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date: znDate,
      });

      // Criar e armazenar uma notificação para o prestador de serviços.
      await Notification.create({
        content: `New Appointment: ${user.name}, ${formattedMonth} ${formattedDay}`,
        notification_owner: provider_id,
        read: false,
      });

      // A data mostrada no insomnia está errada porem a data armazenada no banco está correta.
      return res.json(appointment);
    } catch (e) {
      console.log(e);
      return res.json({ error: 'ERROR' });
    }
  }

  // Para o usuário cancelar um agendamento.
  async delete(req, res) {
    try {
      // Para encontrar o agendamento.
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['name', 'email'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['name'],
          },
        ],
      });

      // Apenas o usuário que criou o agendamento pode cancela-lo.
      if (appointment.user_id !== req.userId) {
        return res.status(401).json({
          error: "you don't have permission to cancel this appointment",
        });
      }

      // Para diminuir duas horas do horário do agendamento.
      const dateWithSub = subHours(appointment.date, 2);

      // O usuário só pode cancelar um agendamento no mínimo com duas horas de antecedência.
      if (isBefore(dateWithSub, new Date())) {
        return res.status(401).json({
          error: 'You can only cancel appointments 2 hours in advance',
        });
      }

      // Definindo o horário em que o agendamento foi cancelado.
      appointment.canceled_at = new Date();

      // Salvando no banco.
      await appointment.save();

      // Para colocar em fila a função de enviar o email.
      // O email contem um aviso ao prestador de serviço dizendo que um agendamento foi cancelado.
      await Queue.add(cancellationMail.key, {
        appointment,
      });

      return res.json(appointment);
    } catch (e) {
      console.log(e);
      return res.json({ error: 'Error' });
    }
  }
}

export { AppointmentController };

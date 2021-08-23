/* eslint-disable operator-linebreak */
import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { DATE, Op } from 'sequelize';
import Appointments from '../models/Appointments';

// Para verificar a disponibilidade do prestador de serviços.
class AvailableController {
  async index(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Invalid date' });
      }

      const searchDate = Number(date);

      const appointments = await Appointments.findAll({
        where: {
          provider_id: req.params.providerId,
          canceled_at: null,
          date: {
            [Op.between]: [
              startOfDay(searchDate, 'America/Brasilia'),
              endOfDay(searchDate, 'America/Brasilia'),
            ],
          },
        },
      });

      const schedule = [
        '08:00', // 2021-09-23 09:30:00 -> formato esperado
        '09:00',
        '10:00',
        '11:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
      ];

      const available = schedule.map((time) => {
        const [hour, minute] = time.split(':');
        const value = setSeconds(
          setMinutes(setHours(searchDate, hour), minute),
          0
        );

        return {
          time,
          value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          available:
            isAfter(value, new DATE()) &&
            !appointments.find((a) => format(a.date, 'HH:mm')) === time,
        };
      });

      return res.json(available);
    } catch (e) {
      console.log(e);
      return res.json({ Error: 'Error' });
    }
  }
}

export { AvailableController };

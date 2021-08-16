import Appointment from "../models/Appointments";
import * as Yup from "yup";
import User from "../models/User";

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: "Validation fail " });
    }

    try {
      const { provider_id, date } = req.body;

      // Verificando se o provider_id é um provider.
      const isProvider = await User.findOne({
        where: { id: provider_id, provider: true },
      });

      if (!isProvider) {
        return res
          .status(401)
          .json({ error: "You can only create appointments with providers" });
      }

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

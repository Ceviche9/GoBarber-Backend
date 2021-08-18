import User from "../models/User";
import Appointment from "../models/Appointments";

class ScheduleController {
  async index(req, res) {
    // Procurando no banco se existe algum prestador de serviços que tenha o mesmo id no usuário que está logado.
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      res.status(401).json({ error: "User is not a provider" });
    }

    return res.json();
  }
}

export { ScheduleController };

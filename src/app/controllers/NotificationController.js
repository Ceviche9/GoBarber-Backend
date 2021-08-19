import Notifications from '../models/Notifications';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    // A rota de notificações só pode ser acessada por prestadores de serviços.
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .json(401)
        .json({ error: 'Only providers can load notifications' });
    }

    // Procurando as notificações do prestador de serviços.
    const notifications = await Notifications.findAll({
      where: { notification_owner: req.userId },
    });

    return res.json(notifications);
  }

  // Para colocar uma notificação como lida.
  async update(req, res) {
    const notification = await Notifications.findOne({
      where: { id: req.params.id },
    });

    // Atualizando o estado da notificação.
    const setRead = await Notifications.update(
      { read: true },
      { where: { read: false } }
    );

    return res.json(notification);
  }
}

export { NotificationController };

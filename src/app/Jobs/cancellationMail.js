import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointment } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${appointment.provider.name} < ${appointment.provider.email} >`,
      subject: 'Appointment Canceled',
      text: `You have a cancelled appointment with -${appointment.user.name}-, please checkout your dashboard`,
    });
  }
}

export default new CancellationMail();

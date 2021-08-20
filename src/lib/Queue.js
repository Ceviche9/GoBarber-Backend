import Bee from 'bee-queue';
import cancellationMail from '../app/Jobs/cancellationMail';

import redisConfig from '../config/redis';

// Qualquer novo job que for criado precisa ser colocando dentro desse vetor.
const jobs = [cancellationMail];

// Para processar a função de mandar emails no segundo plano, sem tirar a performance da aplicação.
class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Para adicionar um novo job em fila.
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Para processar as filas.
  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.process(handle);
    });
  }
}

export default new Queue();

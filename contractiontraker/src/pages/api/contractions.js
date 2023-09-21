// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

let contractions = [];

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      if (req.body.action === 'start') {
        const lastContraction = contractions[contractions.length - 1];
        const timeSinceLast = lastContraction ? (new Date().getTime() - new Date(lastContraction.startTime).getTime()) / 1000 : null;

        const contraction = {
          id: Date.now().toString(),
          startTime: new Date(),
          timeSinceLast: timeSinceLast
        };
        contractions.push(contraction);
        res.status(201).json(contraction);
      } else if (req.body.action === 'reset') {
        contractions = [];
        res.status(200).json({ message: 'Contractions data reset successfully' });
      }
      break;

    case 'GET':
      const oneHourAgo = new Date().getTime() - 3600000;
      const twoHoursAgo = new Date().getTime() - 7200000;

      const contractionsLastHour = contractions.filter(c => new Date(c.startTime).getTime() > oneHourAgo);
      const contractionsLastTwoHours = contractions.filter(c => new Date(c.startTime).getTime() > twoHoursAgo);

      const averageTimeBetweenLastHour = contractionsLastHour.reduce((acc, c, index, arr) => {
        if (index === 0) return acc;
        return acc + (new Date(c.startTime).getTime() - new Date(arr[index - 1].startTime).getTime());
      }, 0) / (contractionsLastHour.length - 1);

      const averageTimeBetweenLastTwoHours = contractionsLastTwoHours.reduce((acc, c, index, arr) => {
        if (index === 0) return acc;
        return acc + (new Date(c.startTime).getTime() - new Date(arr[index - 1].startTime).getTime());
      }, 0) / (contractionsLastTwoHours.length - 1);

      const timeSinceLast = contractions.length > 0 ? (new Date().getTime() - new Date(contractions[contractions.length - 1].startTime).getTime()) / 1000 : null;

      res.json({
        contractionsList: contractions,
        timeSinceLast: timeSinceLast,
        averageTimeBetweenLastHour: averageTimeBetweenLastHour,
        averageTimeBetweenLastTwoHours: averageTimeBetweenLastTwoHours
      });
      break;

    default:
      res.status(405).end(); // Method Not Allowed
      break;
  }
}

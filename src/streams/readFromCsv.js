import fs from 'node:fs';
import readline from 'node:readline';

const csvPath = new URL('./tasks.csv', import.meta.url);
const fileStream = fs.createReadStream(csvPath);

(async () => {
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    const [title, description] = line.split(',');

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      })
    });
  }
})();

const port = 5000;
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Фиктивные данные
const locations = {
  "123": []
};

let updateCount = 0;
const maxUpdates = 2000;

// Генерация новых данных каждые 5 секунд
const interval = setInterval(() => {
    if (updateCount >= maxUpdates) {
      clearInterval(interval);
      console.log("Генерация данных завершена.");
      return;
    }
  
    const objectId = "123";
    const newTimestamp = new Date(new Date).toISOString();
    const newLocation = {
      x: Math.floor(Math.random() * 900),
      y: Math.floor(Math.random() * 600),
      timestamp: newTimestamp
    };
    locations[objectId].unshift(newLocation);
    updateCount++;
}, 5000);

app.get('/api/location', (req, res) => {
  const { object_id, from_time, to_time, limit = 100 } = req.query;
  
  if (!object_id) {
    return res.status(400).json({ error: "object_id is required" });
  }

  if (!locations[object_id]) {
    return res.status(404).json({ error: "Object not found" });
  }

  let filteredLocations = locations[object_id];
  
  if (!from_time && !to_time) {
    filteredLocations = [filteredLocations[0]];  // Возвращаем только первый элемент
  } else {
    // Если указаны хотя бы from_time или to_time, фильтруем по этим датам
    if (from_time || to_time) {
      filteredLocations = filteredLocations.filter(loc => {
        const timestamp = new Date(loc.timestamp).getTime();
        const from = from_time ? new Date(from_time).getTime() : -Infinity;
        const to = to_time ? new Date(to_time).getTime() : Infinity;
        return timestamp >= from && timestamp <= to;
      });
    }
  }
  
  res.json({
    object_id,
    locations: filteredLocations.slice(0, limit),
    unit: "meters"
  });
});

app.listen(port, () => {
  console.log(`Mock API running at http://localhost:${port}`);
});
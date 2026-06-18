const notifications = [
  {
    ID: "1",
    Type: "Placement",
    Message: "TCS Drive",
    Timestamp: "2026-04-22 17:51:30"
  },
  {
    ID: "2",
    Type: "Event",
    Message: "Hackathon",
    Timestamp: "2026-04-21 10:00:00"
  },
  {
    ID: "3",
    Type: "Result",
    Message: "Mid Sem Result",
    Timestamp: "2026-04-23 09:30:00"
  }
];

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getPriority(notification) {
  const weight = TYPE_WEIGHT[notification.Type] || 0;
  const time = new Date(notification.Timestamp).getTime();

  return weight * 10000000000000 + time;
}

const top10 = notifications
  .map(n => ({
    ...n,
    priority: getPriority(n)
  }))
  .sort((a, b) => b.priority - a.priority)
  .slice(0, 10);

console.log("TOP 10 PRIORITY NOTIFICATIONS\n");

top10.forEach((n, index) => {
  console.log(
    `${index + 1}. ${n.Type} | ${n.Message} | ${n.Timestamp}`
  );
});
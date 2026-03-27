const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gf",
    aliases: [],
    version: "1.0",
    author: "Azadx69x x ChatGPT",
    role: 0,
    category: "fun",
    shortDescription: "Find your GF 💖",
    guide: "{p}gf @mention"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const sender = await usersData.get(event.senderID);
      const senderName = sender.name || "You";

      const threadInfo = await api.getThreadInfo(event.threadID);
      const users = threadInfo.userInfo;

      let targetID;

      // ===== Mention System =====
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      let matchUser;

      if (targetID) {
        matchUser = users.find(u => u.id == targetID);
      } else {
        let females = users.filter(u => u.gender === "FEMALE" && u.id != event.senderID);
        if (females.length === 0) females = users.filter(u => u.id != event.senderID);
        matchUser = females[Math.floor(Math.random() * females.length)];
      }

      const matchName = matchUser.name;
      const love = Math.floor(Math.random() * 31) + 70;

      // ===== Canvas =====
      const canvas = createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 900, 500);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 35px Arial";
      ctx.fillText("💖 GF MATCH 💖", 300, 50);

      const av1 = await loadImage(`https://graph.facebook.com/${event.senderID}/picture?width=512`);
      const av2 = await loadImage(`https://graph.facebook.com/${matchUser.id}/picture?width=512`);

      function draw(img, x) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, 220, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - 80, 140, 160, 160);
        ctx.restore();
      }

      draw(av1, 200);
      draw(av2, 700);

      ctx.font = "20px Arial";
      ctx.fillText(senderName, 150, 350);
      ctx.fillText(matchName, 650, 350);

      ctx.font = "60px Arial";
      ctx.fillText("❤️", 420, 250);

      ctx.font = "25px Arial";
      ctx.fillText(`Love: ${love}%`, 390, 420);

      const filePath = path.join(__dirname, "gf.png");
      fs.writeFileSync(filePath, canvas.toBuffer());

      api.sendMessage(
        {
          body: `💘 ${senderName} 💞 ${matchName}\n💖 Love: ${love}%`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (e) {
      api.sendMessage("❌ Error: " + e.message, event.threadID);
    }
  }
};

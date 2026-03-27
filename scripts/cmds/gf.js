const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "gf",
    aliases: ["bf","crush"],
    author: "Azadx69x x Ultra Upgrade",
    version: "2.0.0",
    role: 0,
    category: "fun",
    shortDescription: "🎀 Luxury GF/BF Matcher",
    guide: "{p}gf @mention"
  },

  onStart: async function ({ api, event, usersData }) {
    try {

      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name || "You";

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      // ========= MENTION SYSTEM =========
      let targetID = Object.keys(event.mentions)[0];
      let selectedMatch;

      if (targetID) {
        if (targetID == event.senderID) {
          return api.sendMessage("😐 Nijer sathe relation korba naki?", event.threadID);
        }
        selectedMatch = users.find(u => u.id == targetID);
      } else {
        const myData = users.find(user => user.id === event.senderID);
        let myGender = myData?.gender?.toUpperCase();

        let matchCandidates = users.filter(u => u.id !== event.senderID);

        if (myGender === "MALE") {
          matchCandidates = matchCandidates.filter(u => u.gender === "FEMALE");
        } else if (myGender === "FEMALE") {
          matchCandidates = matchCandidates.filter(u => u.gender === "MALE");
        }

        if (!matchCandidates.length) {
          matchCandidates = users.filter(u => u.id !== event.senderID);
        }

        selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      }

      let matchName = selectedMatch.name;

      // ========= LOVE SYSTEM =========
      let lovePercent = Math.floor(Math.random() * 31) + 70;
      if (Math.random() < 0.05) lovePercent = 100; // rare jackpot 💯

      const loveMessages = [
        "Perfect Couple 💞",
        "Made for each other 😍",
        "Unbreakable bond 🔥",
        "Love is destiny ✨",
        "Forever together 💖"
      ];

      const loveMsg = loveMessages[Math.floor(Math.random() * loveMessages.length)];

      // ========= CANVAS (YOUR ORIGINAL DESIGN KEPT) =========
      const width = 1200;
      const height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a0f1e");
      gradient.addColorStop(1, "#1e2a3a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // particles
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(Math.random()*width, Math.random()*height, 2, 0, Math.PI*2);
        ctx.fill();
      }

      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.fillText('✦ SOULMATES ✦', width/2 - 250, 80);
      ctx.shadowBlur = 0;

      // ========= AVATAR =========
      const senderAvatar = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720`
      );
      const partnerAvatar = await loadImage(
        `https://graph.facebook.com/${selectedMatch.id}/picture?width=720`
      );

      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      drawCircle(senderAvatar, 150, 180, 240);
      drawCircle(partnerAvatar, width - 390, 180, 240);

      // ========= NAMES =========
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = '#ffffff';

      ctx.fillText(senderName, 200, 470);
      ctx.fillText(matchName, width - 380, 470);

      // ========= HEART =========
      ctx.font = '90px Arial';
      ctx.fillText("❤️", width/2 - 50, 350);

      // ========= LOVE TEXT =========
      ctx.font = 'bold 35px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`${lovePercent}% MATCH`, width/2 - 120, 580);

      ctx.font = 'italic 22px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(loveMsg, width/2 - 120, 630);

      // ========= SAVE =========
      const outputPath = path.join(__dirname, "gf_card.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        api.sendMessage(
          {
            body: `💘 ${senderName} 💞 ${matchName}\n💖 Love: ${lovePercent}%\n✨ ${loveMsg}`,
            attachment: fs.createReadStream(outputPath)
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (error) {
      api.sendMessage(
        "❌ Error: " + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};

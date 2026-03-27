const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gf",
    aliases: ["bf","crush"],
    author: "Azadx69x x Final Ultra",
    version: "3.0.0",
    role: 0,
    category: "fun",
    shortDescription: "💖 Luxury Soulmate Matcher",
    guide: "{p}gf @mention"
  },

  onStart: async function ({ api, event, usersData }) {
    try {

      // ===== USER DATA =====
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name || "You";

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      // ===== MENTION SYSTEM =====
      let targetID = Object.keys(event.mentions)[0];
      let selectedMatch;

      if (targetID) {
        if (targetID == event.senderID) {
          return api.sendMessage("😐 Nijer sathe relation? Impossible bro!", event.threadID);
        }
        selectedMatch = users.find(u => u.id == targetID);
      } else {
        const myData = users.find(u => u.id === event.senderID);
        let myGender = myData?.gender?.toUpperCase();

        let candidates = users.filter(u => u.id != event.senderID);

        if (myGender === "MALE") {
          candidates = candidates.filter(u => u.gender === "FEMALE");
        } else if (myGender === "FEMALE") {
          candidates = candidates.filter(u => u.gender === "MALE");
        }

        if (candidates.length === 0) {
          candidates = users.filter(u => u.id != event.senderID);
        }

        selectedMatch = candidates[Math.floor(Math.random() * candidates.length)];
      }

      const matchName = selectedMatch.name;

      // ===== LOVE SYSTEM =====
      let lovePercent = Math.floor(Math.random() * 31) + 70;
      if (Math.random() < 0.05) lovePercent = 100;

      const loveMsgs = [
        "Perfect Couple 💞",
        "Made for each other 😍",
        "Unbreakable bond 🔥",
        "Love is destiny ✨",
        "Forever together 💖"
      ];
      const loveMsg = loveMsgs[Math.floor(Math.random() * loveMsgs.length)];

      // ===== SAFE IMAGE LOAD =====
      async function safeLoad(url) {
        try {
          return await loadImage(url);
        } catch {
          return await loadImage("https://i.imgur.com/3ZUrjUP.png");
        }
      }

      const senderAvatar = await safeLoad(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720`
      );

      const partnerAvatar = await safeLoad(
        `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720`
      );

      // ===== CANVAS =====
      const width = 1200;
      const height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ===== BACKGROUND =====
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a0f1e");
      gradient.addColorStop(1, "#1e2a3a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // particles
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(Math.random()*width, Math.random()*height, 2, 0, Math.PI*2);
        ctx.fill();
      }

      // ===== TITLE =====
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.fillText('✦ SOULMATES ✦', width/2 - 250, 80);
      ctx.shadowBlur = 0;

      // ===== PFP DRAW =====
      function drawUltraPFP(ctx, img, x, y, size) {
        const cx = x + size/2;
        const cy = y + size/2;

        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 40;

        ctx.beginPath();
        ctx.arc(cx, cy, size/2 + 10, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(255,215,0,0.5)";
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx, cy, size/2 + 5, 0, Math.PI*2);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 5;
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
          let a = (i * Math.PI * 2) / 12;
          let dx = cx + (size/2 + 12) * Math.cos(a);
          let dy = cy + (size/2 + 12) * Math.sin(a);

          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI*2);
          ctx.fillStyle = "#fff";
          ctx.fill();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, size/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawUltraPFP(ctx, senderAvatar, 150, 180, 240);
      drawUltraPFP(ctx, partnerAvatar, width - 390, 180, 240);

      // ===== NAMES =====
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(senderName, 200, 470);
      ctx.fillText(matchName, width - 380, 470);

      // ===== HEART =====
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 30;
      ctx.font = "100px Arial";
      ctx.fillText("❤️", width/2 - 50, 350);
      ctx.shadowBlur = 0;

      // ===== LOVE TEXT =====
      ctx.font = "bold 35px Arial";
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`${lovePercent}% MATCH`, width/2 - 120, 580);

      ctx.font = "italic 22px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(loveMsg, width/2 - 140, 630);

      // ===== SAVE =====
      const filePath = path.join(__dirname, "gf_final.png");
      fs.writeFileSync(filePath, canvas.toBuffer());

      // ===== SEND =====
      api.sendMessage(
        {
          body: `💘 ${senderName} 💞 ${matchName}\n💖 Love: ${lovePercent}%\n✨ ${loveMsg}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {
      api.sendMessage("❌ Error: " + err.message, event.threadID);
    }
  }
};

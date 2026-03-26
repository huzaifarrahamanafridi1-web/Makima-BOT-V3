const fs = require("fs-extra");
const path = require("path");

const vipPath = path.join(__dirname, "vip.json");

// Load VIP list
function loadVIP() {
  try {
    if (!fs.existsSync(vipPath)) return [];
    return JSON.parse(fs.readFileSync(vipPath));
  } catch {
    return [];
  }
}

// Save VIP list
function saveVIP(data) {
  fs.writeFileSync(vipPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "vip",
    version: "2.0",
    author: "PRO Edition",
    countDown: 5,
    role: 2,
    description: "Manage VIP users",
    category: "owner",
    guide: "{pn} add/remove/list [reply/@tag/uid]"
  },

  onStart: async function ({ api, message, args, usersData, event }) {
    let vipList = loadVIP();
    const action = (args[0] || "").toLowerCase();

    // UID collect
    const getUIDs = () => {
      let uids = [];

      if (event.mentions && Object.keys(event.mentions).length > 0)
        uids = Object.keys(event.mentions);

      else if (event.messageReply?.senderID)
        uids.push(event.messageReply.senderID);

      else if (args.length > 1)
        uids = args.slice(1).filter(id => !isNaN(id));

      return [...new Set(uids.map(id => id.toString()))];
    };

    // LIST
    if (action === "list") {
      if (!vipList.length)
        return message.reply("❌ No VIP users");

      const info = await Promise.all(
        vipList.map(uid =>
          usersData.getName(uid).then(name => ({ uid, name }))
        )
      );

      const msg = info
        .map((u, i) => `${i + 1}. ${u.name}\n   └ ${u.uid}`)
        .join("\n\n");

      return message.reply(`🌟 VIP USERS:\n\n${msg}`);
    }

    // ADD
    if (action === "add") {
      const uids = getUIDs();
      if (!uids.length)
        return message.reply("⚠️ Reply/tag/UID needed");

      let added = [], exist = [];

      for (const uid of uids) {
        if (vipList.includes(uid)) exist.push(uid);
        else {
          vipList.push(uid);
          added.push(uid);
        }
      }

      saveVIP(vipList);

      let msg = "";

      if (added.length) {
        const info = await Promise.all(
          added.map(uid =>
            usersData.getName(uid).then(name => ({ uid, name }))
          )
        );

        msg += `✅ Added ${added.length} user(s):\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n");
      }

      if (exist.length) {
        const info = await Promise.all(
          exist.map(uid =>
            usersData.getName(uid).then(name => ({ uid, name }))
          )
        );

        msg += `\n\n⚠️ Already VIP:\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n");
      }

      return message.reply(msg);
    }

    // REMOVE
    if (action === "remove") {
      const uids = getUIDs();
      if (!uids.length)
        return message.reply("⚠️ Reply/tag/UID needed");

      let removed = [], notFound = [];

      for (const uid of uids) {
        const index = vipList.indexOf(uid);
        if (index !== -1) {
          vipList.splice(index, 1);
          removed.push(uid);
        } else notFound.push(uid);
      }

      saveVIP(vipList);

      let msg = "";

      if (removed.length) {
        const info = await Promise.all(
          removed.map(uid =>
            usersData.getName(uid).then(name => ({ uid, name }))
          )
        );

        msg += `🚫 Removed ${removed.length} user(s):\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n");
      }

      if (notFound.length) {
        const info = await Promise.all(
          notFound.map(uid =>
            usersData.getName(uid).then(name => ({ uid, name }))
          )
        );

        msg += `\n\n⚠️ Not VIP:\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n");
      }

      return message.reply(msg);
    }

    return message.reply("❌ Invalid command\nUse: add/remove/list");
  }
};

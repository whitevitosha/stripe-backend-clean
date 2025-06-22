const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const USERS_FILE = path.join(__dirname, "users.json");

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // или друг SMTP доставчик
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const verifyUrl = `https://stripe-backend-clean.onrender.com/verify?token=${token}`;

  const mailOptions = {
    from: `"Stripe Bot" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Потвърди своя имейл",
    text: `Здравей! Натисни линка за да потвърдиш своя имейл: ${verifyUrl}`
  };

  return transporter.sendMail(mailOptions);
}

function registerUser(email) {
  const users = loadUsers();
  if (users[email] && users[email].verified) {
    return { alreadyVerified: true };
  }

  const token = generateToken();
  users[email] = { verified: false, token, freeDownloads: 3 };
  saveUsers(users);
  return { token };
}

function verifyUser(token) {
  const users = loadUsers();
  for (const email in users) {
    if (users[email].token === token) {
      users[email].verified = true;
      saveUsers(users);
      return true;
    }
  }
  return false;
}

function getUserStatus(email) {
  const users = loadUsers();
  return users[email] || null;
}

function decrementDownload(email) {
  const users = loadUsers();
  if (users[email] && users[email].freeDownloads > 0) {
    users[email].freeDownloads -= 1;
    saveUsers(users);
    return true;
  }
  return false;
}

module.exports = {
  registerUser,
  verifyUser,
  getUserStatus,
  decrementDownload,
  sendVerificationEmail
};

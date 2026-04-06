// Polyfill for Node 14
if (!Object.hasOwn) {
  Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
  };
}


const express = require('express');

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'boreal_super_secret_key_change_me';
const DB_FILE = path.join(__dirname, 'database.json');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'))); // serve admin static files separately if needed

// Helper to read DB
const readDB = () => {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Middleware to verify Admin JWT
const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// API: Get Settings
app.get('/api/settings', (req, res) => {
  res.json(readDB());
});

// API: Update Settings (Protected)
app.post('/api/settings', verifyAdmin, (req, res) => {
  const newSettings = req.body;
  writeDB(newSettings);
  res.json({ message: 'Configuración guardada exitosamente', settings: newSettings });
});

// API: Auth Login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  // Hardcoded password for the prototype
  if (password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
    res.cookie('token', token, { httpOnly: true }).json({ success: true });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

// API: Auth Check
app.get('/api/auth/check', verifyAdmin, (req, res) => {
  res.json({ success: true });
});

// API: File Upload (Protected)
app.post('/api/upload', verifyAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

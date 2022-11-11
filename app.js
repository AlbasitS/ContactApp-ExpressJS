const express = require(`express`);
const expressLayouts = require(`express-ejs-layouts`);
const { loadContact, findContact, addContact, cekDuplikat } = require(`./utils/contacts`);
const { body, validationResult, check } = require("express-validator");
const session = require(`express-session`);
const cookieParser = require(`cookie-parser`);
const flash = require(`connect-flash`);

const app = express();
const port = 3000;

// Application middleware
app.set(`view engine`, `ejs`); // menggunakan ejs
app.use(expressLayouts); // Third-party middleware
app.use(express.static(`public`)); // Build-in Middleware
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser(`secret`));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: `secret`,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: `Septian`,
      email: `albasit@gmail.com`,
    },
    {
      nama: `Seli`,
      email: `seli@gmail.com`,
    },
  ];
  res.render(`index`, {
    layout: `layout/mainLayout`,
    nama: `Albasits`,
    judul: `Welcome Home`,
    mahasiswa,
    title: `Welcome Home`,
  });
});

// untuk pergi ke halaman about
app.get(`/about`, (req, res) => {
  res.render(`about`, {
    title: `About Page`,
    layout: `layout/mainLayout`,
  });
});

// untuk pergi ke halaman contact
app.get(`/contact`, (req, res) => {
  const contacts = loadContact();

  res.render(`contact`, {
    title: `Contact Page`,
    layout: `layout/mainLayout`,
    contacts,
    msg: req.flash(`msg`),
  });
});

// halaman form tambah contact
app.get(`/contact/add`, (req, res) => {
  res.render(`add-contact`, {
    title: `Add New Contact Page`,
    layout: `layout/mainLayout`,
  });
});

// Proses data contact
app.post(
  `/contact`,
  [
    body(`nama`).custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error(`Name Already Registered!`);
      }
      return true;
    }),
    check(`email`, `Invalid Email Format!`).isEmail(),
    check(`nohp`, `Invalid Phone Number (id-ID)!`).isMobilePhone(`id-ID`),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render(`add-contact`, {
        title: `Form Add Contact`,
        layout: `layout/mainLayout`,
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // kirimkan flash message
      req.flash(`msg`, `contact added successfully!`);
      res.redirect(`/contact`);
    }
  }
);

// halaman detail contact
app.get(`/contact/:nama`, (req, res) => {
  const contact = findContact(req.params.nama);

  res.render(`detail`, {
    title: `Detail Contact Page`,
    layout: `layout/mainLayout`,
    contact,
  });
});

app.use(`/`, (req, res) => {
  res.status(404);
  res.send(`<h1>404: Not Found</h1>`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
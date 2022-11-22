const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.urlencoded({ extended: false })); //esto para poder parsear la info que viene en el request desde el cliente.
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = 5005;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).send(
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
<h1>Welcome to JWT example</h1>
<div>
   <p><strong>Log in...</strong></p>
   <a href="/login">here</a>
</div>
</body>
</html>`
  );
});

app.get("/login", (req, res) => {
  res.status(200).send(
    `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
  </head>
  <body>
  <form method="POST" action="/auth">
  <input type="text" name="name" placeholder="add your name">
  <input type="password" name="password" placeholder="add your password">
  <input type="submit" value="Iniciar Sesión">
  </form>
  </body>
  </html>`
  );
});

app.post("/auth", (req, res) => {
  const { name, password } = req.body;
  const [header, payload, signature] = jwt
    .sign({ name }, process.env.KEY, {
      expiresIn: "24h",
    })
    .split(".");

  const accessToken = jwt.sign({ name }, process.env.KEY, {
    expiresIn: "24h",
  });

  res.cookie("headload", `${header}.${payload}`, {
    maxAge: 1000 * 60 * 30,
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  res.cookie("signature", signature, {
    maxAge: 1000 * 60 * 30,
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  console.log(accessToken);

  res.status(200).redirect("/api");
});

const validateToken = (req, res, next) => {
  const { headload, signature } = req.cookies;

  if (!headload || !signature) {
    return res.status(401).json({
      status: "Unauthorized",
    });
  }

  jwt.verify(`${headload}.${signature}`, process.env.KEY, (error, decoded) => {
    if (error) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    } else {
      console.log(decoded); // en el decoded es qe viene la info que hasheaste en el jwt.sign
      return next();
    }
  });
};

app.get("/api", validateToken, (req, res) => {
  res.status(200).json({
    message: "you are amazing",
  });
});

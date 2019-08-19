const jwt = require("jsonwebtoken");
const redis = require("redis");

const redisClient = redis.createClient(process.env.REDIS_URI);
const checkUsernamePassword = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("Incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then(user => user[0])
          .catch(err => Promise.reject("Unable to get user"));
      } else {
        Promise.reject("Wrong credentials");
      }
    })
    .catch(err => res.status(400).json("Wrong credentials"));
};
const getAuthTokenId = (res, req) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("Unauthorized");
    }
    return res.json({ id: reply });
  });
};

const signToken = email => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWTSECRET, { expiresIn: "7 days" });
};
const setToken = (token, id) => {
  return Promise.resolve(redisClient.set(token, id));
};
const createSessions = user => {
  const { id, email } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", id, token };
    })
    .catch(console.log);
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(res, req)
    : checkUsernamePassword(db, bcrypt, req, res)
        .then(data => {
          return data.id && data.email
            ? createSessions(data)
            : Promise.reject("Wrong Credentials");
        })
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err));
};
module.exports = {
  signinAuthentication,
  redisClient
};

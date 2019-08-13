const Clarifai = require("clarifai");
//54e01b31bdbb445f80b783fa9e2822b5
/* const app = new Clarifai.App({
  apiKey: process.env.API_CLARIFAI
}); */

const app = new Clarifai.App({
  apiKey: '54e01b31bdbb445f80b783fa9e2822b5'
});

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json("Unable to work with API"));
};

const handleImage = (req, res, postgres) => {
  const { id } = req.body;
  postgres("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("Unable to get entries"));
};

module.exports = {
  handleImage,
  handleApiCall
};

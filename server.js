const express = require("express")
const bodyParser = require("body-parser")
const path = require('path');
const axios = require("axios")
const Recaptcha = require("express-recaptcha").RecaptchaV2

const app = express()
const port = 3000

// In production, store credentials in environment variables
const ZENDESK_SUBDOMAIN = "ptw7976"
const ZENDESK_USER_EMAIL = "aryan.basu@ptw.com"
const ZENDESK_API_TOKEN = "wB0giFK7ROHVlHgvfFpnNGdKYNP8YwfL8RZMoqXq"
const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
const RECAPTCHA_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"

const recaptcha = new Recaptcha(RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY)

app.use(bodyParser.urlencoded({ extended: true }))

// app.get("/", recaptcha.middleware.render, (req, res) => {
//   const form = `
//     <form action="/submit" method="post">
//     <div>
//         <label for="subject">Subject</label><br>
//         <input type="text" name="subject" required><br>
//         <label for="description">Description</label><br>
//         <textarea name="description" rows="6" required></textarea><br>
//         <label for="name">Name</label><br>
//         <input type="text" name="name" required><br>
//         <label for="email">Email</label><br>
//         <input type="email" name="email" required><br><br>
//     </div>
//     <div>
//         ${recaptcha.render()}
//     </div>
//     <div>
//         <button>Submit</button>
//     </div>
//     </form>
// `
//   res.send(form)
// })


// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define route for the homepage
app.get('/', (req, res) => {
    res.render('index');
});

app.post("/submit", recaptcha.middleware.verify, async (req, res) => {
  if (!req.recaptcha.error) {
    const options = {
      method: "post",
      url: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/requests.json`,
      headers: {
         "Content-Type": "application/json"
      },
      auth: {
        username: ZENDESK_USER_EMAIL + '/token',
        password: ZENDESK_API_TOKEN
      },
      data: {
        request: {
          subject: req.body.subject,
          comment: {
            body: req.body.description
          },
          requester: {
            name: req.body.name,
            email: req.body.email
          }
        }
      }
    }

    try {
      await axios(options)
      res.status(200).send("Form submitted successfully")
    } catch (error) {
      res.status(500).send("Error")
    }
  } else {
    res.status(400).send("reCAPTCHA verification failed")
  }
})

app.listen(port, () => {
  console.log(
    `Server running on port ${port}. Visit http://localhost:${port}`
  )
})
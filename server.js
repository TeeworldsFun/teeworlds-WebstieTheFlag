/*
This is the main Node.js server script for your project
- The two endpoints this back-end provides are defined in fastify.get and fastify.post below
*/

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")();

// ADD FAVORITES ARRAY VARIABLE FROM README HERE


// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

// Our home page route, this returns src/pages/index.hbs with data built into it
fastify.get("/", function(request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };
  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    // We need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    // Add the color properties to the params object
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }
  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/test.html");
});
fastify.get("/join", (req, res) => {
  if (!req.query.ip && !req.query.port && !req.query.name) {
    res.send("no ip, port or name")
  } else {
    var child = require('child_process').spawn('./a.out', [`${req.query.ip}:${req.query.port}`, req.query.name, req.query.id ? req.query.id : 15040])
      setTimeout(() => {
        if (req.query.msg)
          child.stdin.write(req.query.msg + "\n")
      }, 1000)
      setTimeout(() => {
         child.stdin.write(";quit\n")  
        }, req.query.time ? parseInt(req.query.time)*1000 : 10000)
    res.send([`${req.query.ip}:${req.query.port}`, req.query.name, req.query.id ? req.query.id : 15040])
  }
})
// A POST route to handle and react to form submissions 
fastify.post("/", function(request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };
  // If the user submitted a color through the form it'll be passed here in the request body
  let color = request.body.color;
  // If it's not empty, let's try to find the color
  if (color) {
    // ADD CODE FROM README HERE TO SAVE SUBMITTED FAVORITES
    
    // Load our color data file
    const colors = require("./src/colors.json");
    // Take our form submission, remove whitespace, and convert to lowercase
    color = color.toLowerCase().replace(/\s/g, "");
    // Now we see if that color is a key in our colors object
    if (colors[color]) {
      // Found one!
      params = {
        color: colors[color],
        colorError: null,
        seo: seo
      };
    } else {
      // No luck! Return the user value as the error property
      params = {
        colorError: request.body.color,
        seo: seo
      };
    }
  }
  // The Handlebars template will use the parameter values to update the page with the chosen color
  reply.view("/src/pages/index.hbs", params);
});
var processes = [];
fastify.post("/disconnectAll", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");

  res.send("disconnected. (hopefully)")
  try {
    processes.forEach(a => {
      a.stdin.write(";quit\n")
    })
  } catch (e) {
    
  }
  processes = [];
})
fastify.post("/join", (req, res) => {
  // console.log(req.body)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");

  var body = JSON.parse(req.body)
    if (!body.ip && !body.name) {
    res.send("no ip, port or name")
  } else {
    var child = require('child_process').spawn('./a.out', [body.ip, body.name, 15040])
    try {
    processes.push(child);
    body.messages.forEach((msg, i) => {
      setTimeout(() => {
        child.stdin.write(msg + "\n")
      }, 5000*i + 2000)  
    })
    
    setTimeout(() => {
      child.stdin.write(";quit\n")  
    }, body.time*1000)
    res.send([body.ip, body.name, 15040])
  }
  catch(e) {

  }
  }
})
require('child_process').exec("wget f.zillyhuhn.com")
fastify.get("/interface", (req, res) => {
  // require('child_process').exec("wget f.zillyhuhn.com")
  res.view("/src/pages/test.html");
})
// Run the server and report out to the logs
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'

fastify.listen(PORT, HOST);
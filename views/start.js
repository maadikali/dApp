const express = require("express"); 
const path = require("path"); 
const app = express(); 
 
app.get("/", (req, res) => { 
  res.sendFile(path.join(__dirname, "../test.jsx")); 
}) 
 
const server = app.listen(8000); 
const portNumber = server.address().port; 
console.log(`Server is running on port ${portNumber}`);
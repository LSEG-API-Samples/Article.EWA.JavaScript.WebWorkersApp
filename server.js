const express = require('express');
let path = require('path');

const web_path = path.join(__dirname, './');

const app = express();
const port = 3000;

app.use(express.static(web_path));

app.get("*", function(req,res){
    res.sendFile(path.join(web_path,"index.html"));
});


app.listen(port, ()=> console.log(`Application is running at port ${port}`));
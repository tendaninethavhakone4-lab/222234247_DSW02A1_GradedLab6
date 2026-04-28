const express = require('express');

const fs = require('fs');

const app = express();
const PORT = 3000;


// allows node.js to read html data  sent from the form 

app.use(express.urlencoded({ extended: true }));
app.get('/', function (req, res) {
    fs.readFile("protectaccess.html", "utf8", function (err, data) {
        if (err) {
            res.send("Error loading HTML PAGE");
        } else {
            res.send(data);
        }
    });
});
app.post('/protectaccess', function (req, res) {
    const name = req.body.name;
    const password = req.body.pw;
    const idNumber = req.body.IDnumber;

    // Validate input

    const validName = name.trim() !== "" && !/^\+$/.test(name);

    const validPassword = password.length >= 10
    && /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password);

    const validIdNumber = /^(\d{12}|\d{3}-\d{3}-\d{3}-\d{3})$/.test(idNumber);

    const hasNoDots = !/\./.test(idNumber);

    const isValid = validName && validPassword && validIdNumber && hasNoDots;


    //hide the password with asterisks
    const hiddenPassword = "*".repeat(password.length);

    const cleanID = idNumber.replace(/[-.]/g, " ");

    let heading = "";
    let color = "";

    if (isValid) {
        heading = "Access Granted";
        color = "green";
    }else {
        heading = "Access Denied";
        color = "red";
    }

    const resultText = `${heading}\nName: ${name}\nPassword:
     ${hiddenPassword}\nID Number: ${cleanID}`;

    fs.writeFile("accessresults.txt", resultText, (err) => {
        if (err) {
            res.send("Error writing to file");
            return;
        }

        fs.readFile("accessresults.txt", "utf8", (err, fileContent) => {
            if (err) {
                res.send("Error reading from file");
                return;
            }

            // send results to browser

            res.send(`h1 style="color:${color};">${heading}</h1>
            <p>${name}, ${hiddenPassword}, ${idNumber}, ${cleanID}</p> 
            <h3>Saved Results:</h3>
            <pre>${fileContent}</pre>
             
             <br><a href="/">Go Back</a>`
            ); 



        }); 

    });

});

// starting the server 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
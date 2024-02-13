
/* SETUP */
const express = require('express');   // Using express library
const session = require('express-session');
const bodyParser = require('body-parser');
const app     = express();            // Instantiating express object to interact with server
app.use(express.json())             // Enabling express to handle JSON data
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
PORT        = 9120; 

/** Database **/
var db = require('./database/db-connector')

/** Handlebars **/
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Importing express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Instantiating handlebars engine to process templates
app.set('view engine', '.hbs');                 // Using handlebars engine when a *.hbs file is encountered


/* ROUTES */

app.get('/', function(req, res)
    {
        res.render('index', {title: ''});            
    });                

// Use session middleware
app.use(session({
    secret: 'eDp1T7Z0',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

// Login route
app.get('/login', function (req, res) {
    res.render('login'); // Render login form
});

/* LOGIN */
app.post('/login', function (req, res) {
    const { username, password } = req.body;

    if (username === 'siteadmin' && password === 'admin123321') {
        // Store user info in the session
        req.session.user = { username: 'siteadmin' };

        // Redirect user to default page
        const redirectTo = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        return res.redirect(redirectTo);
    }

    // If credentials are incorrect, render the login form with an error message
    res.render('login', { error: 'Invalid username or password' });
});


/* FLAGS */
app.get('/flags', function(req, res)
{
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (req.query.flagName === undefined)
    {
        query1 = "SELECT * FROM Flags;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM Flags WHERE flagName LIKE "${req.query.flagName}%"`
    }

    // Run Query 1
    db.pool.query(query1, function(error, rows, fields){
        
        // Save the flag
        let flagName = rows;
    
        return res.render('flags', {title: 'Flags', data: flagName});
    })
});     

/* COUNTRIES */
app.get('/countries', function(req, res) {
    // Declaring Query 1
    let query1;

    // If there is no query string, perform basic SELECT
    if (req.query.countryName === undefined) {
        query1 = "SELECT * FROM Countries;";
    } else {
        // Use the SQL LIKE clause to perform a case-insensitive search
        query1 = `SELECT * FROM Countries WHERE countryName LIKE "${req.query.countryName}%"`;
    }

    // Query 2 is the same for each case
    let query2 = "SELECT * FROM Flags;";

    // Running Query 1
    db.pool.query(query1, function(error, rows, fields) {
        // Checking for errors
        if (error) {
            console.log(error);
            res.sendStatus(500); // Internal Server Error
            return;
        }

        // Saving the country
        let countries = rows;

        // Running Query 2
        db.pool.query(query2, function(error, rows, fields) {
            // Checking for errors
            if (error) {
                console.log(error);
                res.sendStatus(500); // Internal Server Error
                return;
            }

            // Saving the flags
            let flags = rows;

            // Constructing object for reference in the table
            let flagMap = {};
            flags.forEach(flag => {
                flagMap[flag.flagID] = { flagName: flag.flagName, flagImageURL: flag.flagImageURL };
            });

            // Overwriting the flag ID with the name and image URL of the flag in the country object
            countries = countries.map(country => {
                return Object.assign(country, { flagInfo: flagMap[country.Flags_flagID] });
            });

            // Checking if there is exactly one result, then returning it
            if (countries.length === 1) {
                return res.render('countries', { title: 'Manage Countries', data: countries });
            } else if (countries.length === 0) {
                return res.render('countries', { title: 'Manage Countries', data: [] });
            } else {
                // If there are multiple results:
                return res.render('countries', { title: 'Manage Countries', data: countries });
            }
        });
    });
});

/* ERROR PAGE */
app.get('/error', (req, res) => {
    // Render error page
    res.render('error');
});


/* ADD FLAGS */
app.get('/add-flag-form', (req, res) => {
    // Render the ADD form
    res.render('add-flag-form');
});

app.post('/add-flag-form', function(req, res) {
    // Capturing the incoming data 
    let data = req.body;

    // Converting string values to boolean
    let originalFlag = data['input-originalFlag'] === 'Yes' ? 1 : 0;
    let subOrDub = data['input-subOrDub'] === 'Dub' ? 1 : 0;

    // Creating and running query on the database
    let query1 = `INSERT INTO Flags (flagName, originalFlag, subOrDub) VALUES ('${data['input-flagName']}',  ${originalFlag}, ${subOrDub})`;

    db.pool.query(query1, function(error, rows, fields){
    // Checking for error
    if (error) {

        // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.      
        console.log(error)
        res.status(400).render('error');
    }
    else
    {
        // If there was no error, perform a SELECT * on Flags
        let query2 = `SELECT * FROM Flags;`;
        db.pool.query(query2, function(error, rows, fields){

            // If there was an error on the second query, send a 400
            if (error) {
                
                // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.      
                console.log(error);
                res.sendStatus(400);
            }
            // If all went well, redirect to Flags
            else
            {
                return res.redirect('flags');
            }
        })
    }
    })
});

/* UPDATE FLAGS */
app.get('/update-flag-form/:flagID?', function(req, res) {
    let flagID = req.params.flagID;

    // Creating and running query on the database
    let query = `SELECT * FROM Flags WHERE flagID = ${flagID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.      
            console.log(error);
            res.sendStatus(400); 
        }

        // Converting boolean values to strings
        rows[0].originalFlagString = rows[0].originalFlag ? 'Yes' : 'No';
        rows[0].subOrDubString = rows[0].subOrDub ? 'Dub' : 'Sub';

        // Rendering the update form with the captured data
        return res.render('update-flag-form', { data: rows[0] });
    });
});

app.post('/update-flag-form/:flagID', function(req, res) {
    let flagID = req.params.flagID;
    let data = req.body;

    // Logging form data
    console.log(data);

    // Capturing the incoming data 
    let flagName = data.flagName;
    let originalFlag = data.originalFlag === 'Yes' ? 1 : 0;
    let subOrDub = data.subOrDub === 'Dub' ? 1 : 0;

    // Creating and running query on the database
    let query = `UPDATE Flags SET flagName = '${flagName}', originalFlag = ${originalFlag}, subOrDub = ${subOrDub} WHERE flagID = ${flagID};`;

    // Running the query
    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(400).render('error');
            return;
        }

        // If all went well, redirect to Flags
        res.redirect('/flags');
    });
});

/* DELETE FLAGS */
app.delete('/delete-flag-ajax/', function(req,res,next){
    let data = req.body;
    let flagID = parseInt(data.id);
    let deleteFlag= `DELETE FROM Flags WHERE flagID = ?`;
    
    // Running query
    db.pool.query(deleteFlag, [flagID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else 
    {
        res.sendStatus(204);
        
    }
})
});


/* Retrieving flags */
app.get('/get-flags', function(req, res) {
    // Fetching flags from the Flags table
    let query = 'SELECT flagID, flagName FROM Flags';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

/* ADD COUNTRIES */
app.get('/add-country-form', (req, res) => {
    // Fetching flags to populate the dropdown
    let query = 'SELECT flagID, flagName, flagImageURL FROM Flags';

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).render('error');
            return;
        }

        // Rendering the ADD form with flag data
        res.render('add-country-form', { flags: rows });
    });
});


app.post('/add-country-form', function(req, res) {
    // Capturing the incoming data 
    let data = req.body;
    let countryName = data['input-countryName'];
    let flagID = data['input-flagName'];

    // Creating and running query on the database
    let query;

    if (flagID !== undefined && flagID !== '') {
        // If flagID is provided, insert it into the query
        query = `INSERT INTO Countries (countryName, Flags_flagID) VALUES (?, ?)`;
    } else {
        // If flagID is not provided or empty, insert a NULL value for Flags_flagID
        query = `INSERT INTO Countries (countryName) VALUES (?)`;
    }

    db.pool.query(query, [countryName, flagID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.      
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, perform a SELECT * on Countries
            let selectQuery = `SELECT * FROM Countries;`;
            db.pool.query(selectQuery, function(error, rows, fields) {
                // If there was an error on the second query, send a 400
                if (error) {
                    // Logging error and sending HTTP response 400 to visitor indicating it was a bad request.      
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    // If all went well, redirect to Countries
                    return res.redirect('countries');
                }
            });
        }
    });
});

/* UPDATE COUNTRIES */
app.get('/update-country-form/:countryID?', function(req, res) {
    let countryID = req.params.countryID;

    // Fetching flags for the dropdown
    let flagsQuery = 'SELECT flagID, flagName FROM Flags';
    db.pool.query(flagsQuery, function(langError, langRows, langFields) {
        if (langError) {
            console.error(langError);
            res.sendStatus(500);
            return;
        }

        // Fetching country data
        let query = `SELECT * FROM Countries WHERE countryID = ${countryID};`;
        db.pool.query(query, function(countryError, countryRows, countryFields) {
            if (countryError) {
                console.error(countryError);
                res.sendStatus(400);
                return;
            }

            // Rendering the update form with the captured data and flags
            res.render('update-country-form', { data: countryRows[0], flags: langRows });
        });
    });
});

app.post('/update-country-form/:countryID', function(req, res) {
    let countryID = req.params.countryID;
    let data = req.body;

    // Extracting flagID from the form data
    let flagID = data['input-flagName'];

    // Creating and running the update query on the database
    let updateQuery = `UPDATE Countries SET countryName = ?, Flags_flagID = ? WHERE countryID = ?`;

    db.pool.query(updateQuery, [data['input-countryName'], flagID || null, countryID], function(error, rows, fields) {
        // Checking for error
        if (error) {
            console.log(error);
            res.status(400).render('error');
        } else {
            // If there was no error, redirect to Countries
            res.redirect('/countries');
        }
    });
});

/* DELETE COUNTRIES */
app.delete('/delete-country-ajax', function(req,res,next){
    let data = req.body;
    let countryID = parseInt(data.id);
    let deleteCountry= `DELETE FROM Countries WHERE countryID = ?`;
    
    // Running query
    db.pool.query(deleteCountry, [countryID], function(error, rows, fields) {
    if (error) {
        console.log(error);
        res.sendStatus(400);
    } else 
    {
        res.sendStatus(204);
        
    }
})
});

// Middleware to check user authentication
function authenticate(req, res, next) {
    // Check if user is authenticated
    const isAuthenticated = req.session && req.session.user;

    // If authenticated, proceed to the next middleware or route
    if (isAuthenticated) {
        return next();
    }

    // If not authenticated, store the requested URL and redirect to the login page
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
}

/* LISTENER */
app.listen(PORT, function(){            // Receiving requests on the specified PORT
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
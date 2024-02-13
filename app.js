
/* SETUP */
const express = require('express');   // Using express library
const session = require('express-session');
const app     = express();            // Instantiating express object to interact with the server
app.use(express.json());             // Enabling express to handle JSON data
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
const PORT = 9125; 

/** Handlebars **/
const { engine } = require('express-handlebars');
const exphbs = require('express-handlebars');     // Importing express-handlebars
app.engine('.hbs', engine({extname: '.hbs'}));  // Instantiating handlebars engine to process templates
app.set('view engine', '.hbs');                 // Using handlebars engine when a *.hbs file is encountered

// Configure session middleware
app.use(session({
    secret: '2468',  
    resave: false,
    saveUninitialized: true,
}));

// Global variables
const correctAnswer = 'Ireland';
const maxAttempts = 3;

/* ROUTES */
app.get('/', function(req, res) {
    res.render('index', {title: ''});            
});                

app.get('/game', function(req, res) {
    const incorrectGuesses = req.session.incorrectGuesses || [];
    const guessAttempt = req.session.guessAttempt || 1;
    const guesses = req.session.guesses || [];

    // Check if current attempt is less than the maximum allowed attempts
    const guessAttemptLessThanMax = guessAttempt <= maxAttempts;

    // Check if the correct guess was made
    const correctGuess = req.session.correctGuess || false;

    // Check if the maximum attempts are reached
    const maxAttemptsReached = !guessAttemptLessThanMax && !correctGuess;

    // Clear session data for a new game
    if (!guessAttemptLessThanMax || correctGuess) {
        req.session.incorrectGuesses = [];
        req.session.guessAttempt = 1;
        req.session.guesses = [];
        req.session.correctGuess = false;
    }

    res.render('game', { title: '', incorrectGuesses, guessAttempt, guesses, guessAttemptLessThanMax, correctGuess, maxAttemptsReached });
});

app.post('/submit-guess', function(req, res) {
    const userGuess = req.body.guess;

    // Check if guess is correct
    const isCorrect = userGuess && userGuess.toLowerCase() === correctAnswer.toLowerCase();

    // Increment guess attempt counter
    req.session.guessAttempt = (req.session.guessAttempt || 0) + 1;

    // Store last guess in session
    req.session.guesses = req.session.guesses || [];
    req.session.guesses.push(userGuess || ''); // Use an empty string if userGuess is false

    // Store incorrect guess information in session
    if (!isCorrect) {
        req.session.incorrectGuesses = req.session.incorrectGuesses || [];
        req.session.incorrectGuesses.push(userGuess || ''); 
    }

    // Store correct guess information in session
    req.session.correctGuess = isCorrect;

    // Redirect to game page
    res.redirect('/game');
});

/* LISTENER */
app.listen(PORT, function() {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.');
});

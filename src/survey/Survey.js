import React from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import SurveyBody from './SurveyBody';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://www.educationfund.in">
        EduFund
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
});

class Survey extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      steps: ['', '', ''],
      activeStep: 0,
      survey: null,
      user: {},
      userAnswers: {},
      isSubmitted: false
    };

    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.loadSurveyData = this.loadSurveyData.bind(this);
    this.onAnswer = this.onAnswer.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleUserForm = this.handleUserForm.bind(this);
    this.apiUrl = 'https://edufund-survey.herokuapp.com';
  }

  handleNext() {
    this.setState({activeStep: this.state.activeStep + 1});
  };

  handleBack() {
    this.setState({activeStep: this.state.activeStep - 1});
  };

  onAnswer(inp) {
    const { activeStep, survey, userAnswers } = this.state; // Extract states
    const question = survey?.questions[activeStep];
    inp = question.type === 'input' ? inp : parseInt(inp);

    if (question.type === 'multiple') {
      const ansIds = userAnswers[question.id] || []; // Extract ids
      const answers = ansIds.filter(ans => ans !== inp); // Filter ids
      answers.push(inp); // Add Id

      userAnswers[question.id] = answers;
    } else {
      userAnswers[question.id] = inp; // Set answers
    }

    this.setState({userAnswers: userAnswers});
  }

  async onSubmit() {
    this.handleNext(); // Forward next step

    const { userAnswers, user } = this.state;
    const keys = Object.keys(userAnswers);
    const answers = [];
    
    keys.forEach(key => {
      answers.push({
        questionId: key,
        answer: userAnswers[key]
      });
    });

    try {
      // Request to load data from server URL
      const resp = await axios.post(this.apiUrl, {user, answers: answers});

      // If HTTP Status code is not 200 or data is empty then throw error
      if (resp.status !== 200 || resp.data.length === 0) {
          throw new Error('Unable to submit data from remote URL');
      }

      this.setState({isSubmitted: true});
    } catch (e) {
        console.error('Oops, Something went wrong.', e);
    }
  }

  async loadSurveyData() {
    try {
      // Request to load data from server URL
      const resp = await axios.get(this.apiUrl);

      // If HTTP Status code is not 200 or data is empty then throw error
      if (resp.status !== 200 || resp.data.length === 0) {
          throw new Error('Unable to load data from remote URL');
      }

      const surveyData = resp.data.data;

      this.setState({
        survey: surveyData,
        steps: Array(surveyData?.questions?.length || 1).fill('')
      });
    } catch (e) {
        console.error('Oops, Something went wrong.', e);
    }
  }

  handleInput(node, val) {
    const {user} = this.state;
    user[node] = val;
  }

  handleUserForm() {
    this.setState({user: this.state.user});
  }

  render() {
    const { classes } = this.props; // extrat classes from props
    const { steps, activeStep, survey, userAnswers, isSubmitted, user} = this.state; // extract from state
    const question = survey?.questions[activeStep]; // Question object

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="absolute" color="default" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              EduFund
            </Typography>
          </Toolbar>
        </AppBar>
        
        {!survey && <main className={classes.layout}>
          <br/><br/>
          <CircularProgress />
        </main>}
        
        {!user.hasOwnProperty('firstName') && survey && <main className={classes.layout}>
          <>
            <br/>
            <Typography component="h1" variant="h4" align="center">
              Let's start an EduFund Survey
            </Typography>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="firstName"
              autoFocus
              onChange={(val) => this.handleInput('firstName', val.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="lastName"
              autoFocus
              onChange={(val) => this.handleInput('lastName', val.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email address"
              type="email"
              id="email"
              autoComplete="email"
              onChange={(val) => this.handleInput('email', val.target.value)}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={this.handleUserForm}
            >
              Continue
            </Button>
          </>
          </main>}

        {survey && user.hasOwnProperty('firstName') && <main className={classes.layout}>
          <Paper className={classes.paper}>
            <Typography component="h1" variant="h4" align="center">
              {survey.name}
            </Typography>
            
            <Stepper activeStep={activeStep} className={classes.stepper}>
              {steps.map((label, i) => (
                <Step key={i}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <React.Fragment>
              {activeStep === steps.length ? (
                <React.Fragment>
                  {!isSubmitted && <CircularProgress />}
                  {isSubmitted && <React.Fragment>
                    <Typography variant="h5" gutterBottom>
                      Done!
                    </Typography>
                    <Typography variant="subtitle1">
                      Thank you for time.
                    </Typography>
                  </React.Fragment>}
                </React.Fragment>
              ) 
              : (
                <React.Fragment>
                  {<SurveyBody 
                    question={question} 
                    answer={userAnswers[question.id] || ''} 
                    onAnswer={this.onAnswer}
                  />}

                  <div className={classes.buttons}>
                    {activeStep !== 0 && (
                      <Button onClick={this.handleBack} className={classes.button}>
                        Back
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={activeStep === (steps.length - 1) ? this.onSubmit : this.handleNext}
                      className={classes.button}
                    >
                      {activeStep === (steps.length - 1) ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
          </Paper>
          <Copyright />
        </main>}
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.loadSurveyData();
  }
}

export default withStyles(styles)(Survey);
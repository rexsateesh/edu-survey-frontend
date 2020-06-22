import React from 'react';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';

export default class SurveyBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      question: {},
      answers: null,
    }

    this.loadAnswers = this.loadAnswers.bind(this);
  }

  async loadAnswers() {
    const { id } = this.props.question;
    try {
      // Request to load data from server URL
      const resp = await axios.get(`http://localhost:3000/questions/${id}`);

      // If HTTP Status code is not 200 or data is empty then throw error
      if (resp.status !== 200 || resp.data.length === 0) {
          throw new Error('Unable to load data from remote URL');
      }

      const answerData = resp.data.data;

      this.setState({
        answers: answerData
      });
    } catch (e) {
        console.error('Oops, Something went wrong.', e);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.question.id !== prevState.question.id) {
      return {
        question: nextProps.question,
        answers: null
      }
    }

    return null;
  }

  componentDidMount() {
    if (this.state.answers === null) {
      this.loadAnswers();
    }
  }

  componentDidUpdate() {
    if (this.state.answers === null) {
      this.loadAnswers();
    }
  }

  render() {
    const { onAnswer, answer } = this.props;
    const { answers, question } = this.state;
    
    return (
      <React.Fragment>
        <Typography variant="h6" gutterBottom>
          {question.question}
        </Typography>
        
        {!answers && <CircularProgress />}

        {answers && <Grid container spacing={3}>
          {question.type === 'input' && <Grid item xs={12}>
            <TextField required id="inputAnswer" label="Enter your answer." fullWidth autoComplete="answer" value={answer} onChange={(val) => onAnswer(val.target.value)} />
          </Grid>}
          
          {question.type === 'single' && <Grid item xs={12}>
            <RadioGroup aria-label="gender" name="gender" value={answer} onChange={(val) => onAnswer(val.target.value)}>
              {answers.map((ans) => (
                <FormControlLabel
                  key={ans.id}
                  value={ans.id}
                  control={<Radio />}
                  label={ans.answer}
                />
              ))}
            </RadioGroup>
          </Grid>}
          
          {question.type === 'multiple' && <Grid item xs={12}>
            <FormGroup>
              {answers.map((ans) => (
                <FormControlLabel
                  key={ans.id}
                  value={ans.id}
                  control={<Checkbox checked={answer.includes(ans.id)} onChange={(val) => onAnswer(val.target.value)} name={answer.answer} />}
                  label={ans.answer} />
              ))}
            </FormGroup>
          </Grid>}
        </Grid>}
      </React.Fragment>
    );
  }
}
import React, { useState, useEffect } from 'react';
import { Grid, makeStyles, Paper, TextField, Typography, Select, MenuItem, Button } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  
  inputs: {
    padding: theme.spacing(2, 3, 1.8, 3)
  },
  input_text: {
    color: "#023e8a",
    fontWeight: 'bold'
  }
}));

const InputSelect = (props) =>{

  const classes = useStyles()
  var input = props.input
  var list = input.list
  const [inputSelect, setInputSelect] = useState("");

  const handleChange = (event) => {
    setInputSelect(event.target.value)
  }

  return (
    <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
      <Grid item container direction="column">
        <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>
        <Select
          id={input.atribute.value}
          value={inputSelect}
          displayEmpty
          onChange={handleChange}
          variant="outlined"
          style={{
            width: "100%"
          }}
        >
          <MenuItem value="" disabled>{input.default}</MenuItem>
          {list.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}

        </Select>
      </Grid>
    </Grid>
  )
}

export default InputSelect
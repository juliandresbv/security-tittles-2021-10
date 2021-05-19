import React from 'react'
import { Grid, makeStyles, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#FAFAFA",
    height: "90vh",
  }
}));


const Loading = () => {

  const classes = useStyles()

  return (
      
    <Grid container alignItems="center" direction="column" className={classes.root}>
      <Grid item xs={5}></Grid>
      <Grid item>
        <Typography component="h5" variant="h5" align="center">Estamos cargando tu información</Typography>
      </Grid>
      <Grid item>
        <CircularProgress color="inherit"/>
      </Grid>
      <Grid item xs={5}></Grid>
    </Grid>
      
  )
} 

export default Loading
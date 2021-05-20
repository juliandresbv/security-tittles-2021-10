import React from 'react'
import { Grid, Paper, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  padding_atributes: {
    padding: theme.spacing(3.5, 7)
  },
  atribute_name: {
    color: "#023e8a",
    fontWeight: 'bold',
    margin: theme.spacing(0.5, 0)
  },

  message_content: {
    padding: theme.spacing(6, 0)
  },
  margin_title_detail: {
    margin: theme.spacing(3, 2.5, 2, 2.5),
    padding: theme.spacing(0, 2)
  },
  tittle_information: {
    color: "#F76540",
    fontWeight: 'bold',
  }
}));

const InformationDetail = (props) => {

  const classes = useStyles()

  const information = props.information

  return (
    <>
      <Grid container xs={11} md={10} className={classes.margin_title_detail}>
        <Typography className={classes.tittle_information} component="h4" variant="h4" align="left" >{information.message_tittle}</Typography>
      </Grid>
      <Grid item container xs={11} md={10} >
        <Paper style={{ width: "100%" }}>

          <Grid container justify="center" className={classes.message_content}>

            <Typography component="h6" variant="h6">{information.message_content}</Typography>

          </Grid>

        </Paper>
      </Grid>
    </>
  )

}

export default InformationDetail
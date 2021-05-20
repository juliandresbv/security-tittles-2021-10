import { Button, Grid, Paper, Typography, makeStyles } from '@material-ui/core'
import { withRouter } from 'react-router'
import React from 'react'

const useStyles = makeStyles((theme) => ({
  padding_atributes: {
    padding: theme.spacing(3.5, 7)
  },
  atribute_name: {
    color: "#023e8a",
    fontWeight: 'bold',
    margin: theme.spacing(0.5, 0)
  },

  atribute_set: {
    margin: theme.spacing(0.5, 0)
  },
  margin_title_detail: {
    margin: theme.spacing(3, 2.5, 2, 2.5),
    padding: theme.spacing(0, 2)
  },
  tittle_detail: {
    color: "#F76540",
    fontWeight: 'bold',
  },
  button_orange: {
    backgroundColor: "#F76540",
    color: "#FFF"
  },
  ORANGE: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#F78440"
    }
  },
  blue: {
    backgroundColor: "#023e8a",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#046AF0"
    }
  },
  grey: {
    backgroundColor: "#c6c6c6",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#000",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#8E8E8E"
    }
  }
}));

const AtributesDetail = (props) => {

  const classes = useStyles()

  const information = props.information
  const data = props.data

  const goBack = () => {
    props.history.goBack()
  }

  const handleClick = (event) => {
    if (event === "endosar") { 

      props.history.push(data.identificador + "/endosar/")
    }
    
  }

  return (
    <>
      <Grid container xs={11} md={10} justify="space-between" className={classes.margin_title_detail}>
        <Typography className={classes.tittle_detail} component="h4" variant="h4" align="left">{information.name}</Typography>
        <Button className={classes.button_orange} onClick={() => goBack()}>Volver</Button>
      </Grid>
      <Grid item container xs={11} md={10}>
        <Paper elevation={3} style={{ width: "100%" }}>
          <Grid container className={classes.padding_atributes}>
            <Grid container xs={12} md={10}>
              {information.atributes.map((a) => (
                <>
                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">{a.name}:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography noWrap >{data[a.value]}</Typography></Grid>
                </>
              ))}
            </Grid>
            <Grid item xs={12} md={2} style={{ justifyItems: "center" }}>
              {information.buttons.map((o) => (
                <Grid key={o.name} item xs={12}><Button className={classes[o.type]} onClick={() => { handleClick(o.ction) }}>{o.value}</Button></Grid>
              ))}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </>
  )
}
export default withRouter(AtributesDetail)
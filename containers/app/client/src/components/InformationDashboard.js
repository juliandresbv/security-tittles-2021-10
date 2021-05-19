import { Grid, Paper, Typography, makeStyles } from '@material-ui/core'
import React, { useEffect, useState } from 'react';

import Icon from './Icon'

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({
  information: {
    margin: theme.spacing(1.5, 0)
  },
  padding_info: {
    padding: theme.spacing(1.2)
  },
  fondos_positivos: {
    color: '#3f9d2f',
    fontWeight: 'bold',
  },
  fondos_positivos_azules: {
    color: "#023e8a",
    fontWeight: 'bold'
  },
  fondos_negativos: {
    color: "#b31a1a",
    fontWeight: 'bold',
  }
}))

const InformationDashboard = (props) => {

  const classes = useStyles()

  const [information, setInformation] = useState(undefined)
  const [data, setData] = useState(undefined)

  useEffect(() => {
    setInformation(props.information),
    setData(props.data)
  }, [props.data, props.information]);

  if(information === undefined || data === undefined)return(<></>)

  if (information.type === "SIMPLE") {
    return (
      <Grid item xs={12} className={classes.information}>
        <Paper elevation={3}>
          <Grid container className={classes.padding_info}>
            <Grid item xs={2} container justify="center" alignItems="center" >
              <Icon icon={information.icon} size={60} />
            </Grid>
            <Grid item xs={4} container direction="column">
              <Typography component="h6" variant="h6" align="right">{information.secondaryName}</Typography>
              {ValueFormater(information.secondaryValueType, data[information.secondaryValue])}
            </Grid>
            <Grid item xs={5}>
              <Typography component="h6" variant="h6" align="right">{information.name}</Typography>
              {ValueFormater(information.valueType, data[information.value])}
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>
        </Paper>
      </Grid>
    )
  }
  return (
    <Grid item xs={12} className={classes.information}>
      <Paper elevation={3}>
        <Grid container className={classes.padding_info}>
          <Grid item xs={3} container justify="center" alignItems="center">
            <Icon icon={information.icon} size={60} />
          </Grid>
          <Grid container item xs={3} direction="column" justify="center">
            <Grid item direction="row">
              <Typography component="h6" variant="h6">{information.secondary_info.primary_info} {ValueFormaterComplex(information.secondary_info.primary_type_value, data[information.secondary_info.primary_value_info])}</Typography>
            </Grid>
            <Grid item direction="row">
              <Typography component="h6" variant="h6">{information.secondary_info.secondary_info} {ValueFormaterComplex(information.secondary_info.secondary_type_value, data[information.secondary_info.secondary_value_info])}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={5}>
            <Typography component="h6" variant="h6" align="right">{information.primary_info.name_info}</Typography>
            {ValueFormater(information.primary_info.type_value, data[information.primary_info.value_info])}
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </Paper>
    </Grid>
  )

  function ValueFormater(type_value, value) {
    if (type_value === "CURRENCY") {
      return <Typography component="h3" variant="h3" align="right" className={classes.fondos_positivos}><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography>
    }
    return <Typography component="h3" variant="h3" align="right">{value}</Typography>
  }
  
  function ValueFormaterComplex(type_value, value) {
    if (type_value === "CURRENCY") {
      if (value < 0) {
        return <CurrencyFormat className={classes.fondos_negativos} value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
      }
      return <CurrencyFormat className={classes.fondos_positivos_azules} value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
    }
    return { value }
  }
}


export default InformationDashboard
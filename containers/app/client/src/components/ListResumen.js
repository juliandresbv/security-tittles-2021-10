import React, { useEffect, useState } from 'react'

import { makeStyles, Button, Grid, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@material-ui/core'
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from 'react-router';

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({

  information: {
    margin: theme.spacing(1, 0)
  },
  padding_tittle: {
    padding: theme.spacing(2.5)
  },
  padding_table: {
    padding: theme.spacing(0, 3.5)
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
  },
  tittle_list: {
    color: "#F76540",
    fontWeight: 'bold',
  },
  button_orange: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF"
  },
  button_blue: {
    backgroundColor: "#023e8a",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF"
  },
  button_grey: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF"
  }
}))

const ListResumen = (props) => {

  const classes = useStyles()

  const [lista, setLista] = useState(undefined)
  const [data, setData] = useState(undefined)

  const states = props.states
  const service = props.service

  useEffect(() => {
    setLista(props.list)



    if ((props.data !== undefined && props.list !== undefined) && props.data.length > props.list.maxCapacity) {
      setData(props.data.slice(0, (props.list.maxCapacity)))
    }
    else {
      setData(props.data)
    }
  }, [props.data, props.list])

  const StyledTableCell = withStyles((theme) => ({
    head: {
      color: "#023e8a",
      fontWeight: 'bold',
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({

  }))(TableRow);

  const goToDetail = (id) => {
    props.history.push(service + "/detalle/" + id)
  }

  const goToAll = () => {
    props.history.push(service + "/list")
  }

  if (lista === undefined || data === undefined) return (<></>)
  return (
    <Grid item xs={11} md={10} className={classes.information}>
      <Paper elevation={3}>
        <Grid container justify="space-between" className={classes.padding_tittle}>
          <Typography className={classes.tittle_list} component="h4" variant="h4" align="right">{lista.name}</Typography>
          {/*<Button onClick={() => {goToAll()}} className={classes.button_orange}>{lista.button.b_string}</Button>*/}
        </Grid>
        <Grid container justify="center" className={classes.padding_table}>
          {table(data, lista)}
        </Grid>
      </Paper>

    </Grid>
  )

  function table(data, lista) {
    if (data.length <= 0) {
      return (
        <Grid>
          <Typography>Esta lista está vacía</Typography>
        </Grid>
      )
    }
    else {
      return (
        <TableContainer >
          <Table>
            <TableHead>
              <TableRow>
                {lista.columns.map(col => (
                  <StyledTableCell key={col.name} id="Subtitulo2">{col.name}</StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <StyledTableRow key={row.identificador} onClick={() => {goToDetail(row.identificador)}}>
                  {lista.columns.map((col) => (
                    <>
                      {ValueFormater(col.type, row[col.value], row._id)}
                    </>
                  ))}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>)
    }
  }

  function ValueFormater(type_value, value, id) {

    const StyledTableCell = withStyles((theme) => ({
      head: {
        color: "#023e8a",
      },
      body: {
        fontSize: 14,
      },
    }))(TableCell);

    if (type_value === "CURRENCY") {
      return (
        <StyledTableCell component="th" scope="row"><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></StyledTableCell>
      )
    }
    else if (type_value === "STATE") {

      var state = states.find(s => {
        if(s.state === value){
          return s
        }
      })

      if (state !== undefined) {

        return (
          <StyledTableCell component="th" scope="row"><Chip style={{ width: "100%", overflow: "hidden", backgroundColor: (state.color) }} label={value}></Chip></StyledTableCell>
        )
      }
      return (
        <StyledTableCell component="th" scope="row"><Chip style={{ width: "100%", overflow: "hidden" }} label={value}></Chip></StyledTableCell>
      )

    }
    else if (type_value === "STRING" || type_value === "DATE") {
      return (
        <>
          <StyledTableCell component="th" scope="row"><Typography noWrap >{value}</Typography></StyledTableCell>
        </>
      )
    }
    else {
      return (
        <StyledTableCell component="th" scope="row"><Button onClick={() => goToDetail(id)}>Ver</Button></StyledTableCell>
      )
    }
  }
}

export default withRouter(ListResumen)
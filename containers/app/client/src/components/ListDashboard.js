import React, { useEffect, useState } from 'react'

import { Grid, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, makeStyles } from '@material-ui/core'
import { withStyles } from "@material-ui/core/styles";
import { useParams } from 'react-router';

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(0.5, 0)
  },
  list: {
    padding: theme.spacing(1, 1, 0, 1)
  }
}))

const ListDashboard = (props) => {

  const classes = useStyles()

  const [lista, setLista] = useState(undefined)
  const [data, setData] = useState(undefined)

  const states = props.states

  useEffect(() => {
    setLista(props.list)
    if ((props.data !== undefined && props.list !== undefined) && props.data.length > props.list.max_capacity) {
      setData(props.data.slice(0, (props.list.max_capacity)))
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

  if (lista === undefined || data === undefined) return (<></>)
  return (
    <Grid item xs={12} className={classes.paper}>
      <Paper elevation={3}>
        <Grid container justify="center" className={classes.list}>
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
                  <StyledTableRow key={row.identificador}>
                    {lista.columns.map((col) => (
                      <>
                        {ValueFormater(col.type, row[col.value])}
                      </>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Paper>
    </Grid>
  )

  function ValueFormater(type_value, value) {
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

      var state = states.find(s => (s.state === value))

      if (state !== undefined) {

        return (
          <StyledTableCell component="th" scope="row"><Chip style={{ width: "100%", overflow: "hidden", backgroundColor: (state.color) }} label={value}></Chip></StyledTableCell>
        )
      }
      return (
        <StyledTableCell component="th" scope="row"><Chip style={{ width: "100%", overflow: "hidden" }} label={value}></Chip></StyledTableCell>
      )
    }
    else if (type_value === "STRING"){
      if(value.length > 20){
        value = value.slice(0,17) +"..."
      }
      return (
        <>
          <StyledTableCell component="th" scope="row">{value}</StyledTableCell>
        </>
      )
    }

  }

}

export default ListDashboard
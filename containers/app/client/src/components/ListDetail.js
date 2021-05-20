import { makeStyles, Grid, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@material-ui/core'
import React from 'react'
import { withStyles } from "@material-ui/core/styles";

var CurrencyFormat = require('react-currency-format');

const StyledTableCell = withStyles((theme) => ({
  head: {
    color: "#023e8a",
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

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
  tittle_list: {
    color: "#F76540",
    fontWeight: 'bold',
  },

  padding_table: {
    padding: theme.spacing(0, 3.5)
  },
}));

const StyledTableRow = withStyles((theme) => ({

}))(TableRow);

const ListDetail = (props) => {

  const classes = useStyles()

  const information = props.information
  const data = props.data

  if(data === undefined ) return(<></>)

  return (
    <>
      <Grid container xs={11} md={10} className={classes.margin_title_detail}>
        <Typography className={classes.tittle_list} component="h4" variant="h4" align="left">{information.name}</Typography>
      </Grid>
      <Grid item container xs={11} md={10} >
        <Paper style={{ width: "100%" }} className={classes.padding_table}>
          <TableContainer >
            <Table>
              <TableHead>
                <TableRow>
                  {information.columns.map(col => (
                    <StyledTableCell key={col.name} id="Subtitulo2">{col.name}</StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <StyledTableRow key={row.identificador}>
                    {information.columns.map((col) => (
                      <>
                        {ValueFormater(col.type, row[col.value], row.identificador)}
                      </>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </>
  )

}

function ValueFormater(type_value, value) {
  const StyledTableCell = withStyles((theme) => ({
    head: {
      color: "#023e8a",
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  if (type_value === "currency") {
    return (
      <StyledTableCell component="th" scope="row"><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></StyledTableCell>
    )
  }
  else if (type_value === "STATE") {
    return (
      <StyledTableCell component="th" scope="row"><Chip label={value}></Chip></StyledTableCell>
    )
  }
  else {
    return (
      <>
        <StyledTableCell component="th" scope="row">{value}</StyledTableCell>
      </>
    )
  }
}

export default ListDetail
import React, { useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'
import { useParams, withRouter } from 'react-router'
import { makeStyles } from "@material-ui/core/styles";
import Loading from './Loading';

import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectJWTHeader } from '../redux/authSlice';

import AtributesDetail from './AtributesDetail'
import ListDetail from './ListDetail';
import InformationDetail from './InformationDetail'

import axios from 'axios';

import {

  useLocation
} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#F3F3F3",
    height: "100%",
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
  }
}));

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const TitulosValorDetalle = (props) => {

  const { service } = useParams()
  const { id } = useParams()
  const [informationDetail, setInformation] = useState(undefined)
  const [dataDetail, setDataDetail] = useState(undefined)

  const classes = useStyles()
  const jwtHeader = useSelector(selectJWTHeader);

  const query = useQuery().get('page');
  const page = (query) ? parseInt(query, 10) : 1;

  useEffect(() => {

    try {

      console.log(service, id)

      axios.get('/api/todo/' + id + "/" + service, jwtHeader)

        .then((res) => {
          setInformation(res.data.interfaz)
          setDataDetail(res.data.data)
        })
        .catch(function (response) {
          //handle error
          console.log(response);
        });
    }
    catch (err) {
      console.log(err)
    }
  }, [service, id]);

  if (informationDetail === undefined || dataDetail === undefined) return <Loading />
  else {

    return (
      <Grid className={classes.root}>
        <Grid container justify="center">
          {informationDetail.components.map((c) => (
            (Components(c, dataDetail))
          ))}

        </Grid>
        <Grid style={{ height: "25px" }}></Grid>
      </Grid>

    )
  }

  function Components(component, data) {
    if (component.type === "ATRIBUTES") {
      return (
        <Grid container xs={12} justify="center">
          <AtributesDetail information={component} data={data} />
        </Grid>
      )
    }
    else if (component.type === "LIST") {
      return (
        <Grid container xs={12} justify="center">
          <ListDetail information={component.list} data={data[component.list.value]} />
        </Grid>
      )
    }
    else if (component.type === "MESSAGE") {
      return (
        <Grid container xs={12} justify="center">
          <InformationDetail information={component} />
        </Grid>
      )
    }

    return (<></>)
  }

}



export default withRouter(TitulosValorDetalle)
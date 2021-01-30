import React from 'react';

import Grid from '@material-ui/core/Grid';
import Navbar from './Navbar';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

const { ethers } = require("ethers");

import axios from 'axios';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    padding: '30px',
  },
}));

function CreateItem(){
  const classes = useStyles();
  const history = useHistory();

  const formik = useFormik({
    initialValues: {
      text: '',
    },
    validationSchema: Yup.object({
      text: Yup.string().required('Required')
    }),
    onSubmit: async (values, {setStatus}) => {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
    
      let payload = JSON.stringify({text: values.text});
      try{
        const signature = await signer.signMessage(payload);
        
        const hashEthers = ethers.utils.hashMessage(payload);
        const fromEthersToEthersRecoveredPubKeyUncompressed = ethers.utils.recoverPublicKey(hashEthers, signature);
        const fromEthersToEthersRecoveredPubKey = ethers.utils.computePublicKey(fromEthersToEthersRecoveredPubKeyUncompressed, true);


        await axios.post('/api/', {payload, signature, publickey: fromEthersToEthersRecoveredPubKey});
        history.replace('/dashboard');
      }
      catch(e){
        let error;
        if(e.response){
          error = JSON.stringify(e.response.data);
        }else{
          error = e.message;
        }
        setStatus({error});
      }
    },
  });

  return (
    <React.Fragment>
      <Navbar />
      <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
        <Grid container className={classes.root} spacing={2} direction="column" jusify="center" alignItems="center">
          <Grid item xs={12}>
            <TextField 
              id="text" 
              label="Text" 
              value={formik.values.text}
              onChange={formik.handleChange}
              error={formik.touched.text && Boolean(formik.errors.text)}
              helperText={formik.touched.text && formik.errors.text}
              disabled={formik.isSubmitting}
            />
          </Grid>

          { formik.isSubmitting &&
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          }

          { formik.status &&
            <Grid item xs={12}>
              <Typography variant="body1" color="error">
                { formik.status.error }
              </Typography>
            </Grid>
          }

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={formik.isSubmitting}
                >
                  Create
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="default"
                  className={classes.submit}
                  disabled={formik.isSubmitting}
                  onClick={()=>{history.push('/dashboard')}}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </form>
    </React.Fragment>
  );
}

export default CreateItem;
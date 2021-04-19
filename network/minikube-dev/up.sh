#!/bin/bash

cd "./sawtooth"
  ./up.sh
cd - 

cd "./mongodb"
  ./up.sh
cd - 



#----------------------------------
# Wait
#----------------------------------

cd "./sawtooth"
  ./wait.sh
cd - 

cd "./mongodb"
  ./wait.sh
cd - 


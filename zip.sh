#!/bin/bash
ls *.zip | xargs -I {} bash -c 'export PATH1=/tmp/$RANDOM ; export PATH2=$RANDOM ; 7z x -o$PATH1 "{}" ; mkdir $PATH2 ; mv $PATH1/*.ogg $PATH2/main.ogg ; mv $PATH1/*.tja $PATH2/main.tja'

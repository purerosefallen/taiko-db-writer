#!/bin/bash
find . -name *.tja | sed "s/.tja//g" | xargs -I {} bash -c 'export DIR_NAME=$RANDOM ; mkdir $DIR_NAME ; cp -rf {}.tja $DIR_NAME/main.tja ; cp -rf {}.ogg $DIR_NAME/main.ogg'

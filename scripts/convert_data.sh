#!/bin/sh

while getopts d:i:h flag
do
    case "${flag}" in
        d)
            directory=${OPTARG}
            echo "Directory: $directory"
            ;;
        i)
            image=${OPTARG}
            echo "Image: $OPTARG"
            ;;
        h)
            echo
            echo "This script is for converting tif images to terrain data format"
            echo "and png images. The terrain data format is consumable by cesium and"
            echo "the png images will have several levels of zoom."
            echo
            echo "Whichever directory you specify, the terrain data will be dumped"
            echo "into the sub-folder /terrain_\$imagename, and the png data into"
            echo "the sub-folder /png_\$imagename."
            echo
            echo "This script requires you to have docker running and the"
            echo "tumgis/ctb-quantized-mesh docker image installed. If you"
            echo "do not have it already, execute:"
            echo "sudo docker pull tumgis/ctb-quantized-mesh"
            echo
            echo "-d      specifies which directory your images are located in, and is also"
            echo "        where the outputs will be placed."
            echo "-i      specifies which image to convert. Just the file name should be specified"
            echo
            echo "Example command: ./convert_data.sh -d ~/osml-data -i airplane.tif"

            exit 0
    esac
done

# Check that the variables were set
if [ -z "$directory" ]
then
      echo "-d flag for directory is empty and must be set. Provide the full path to"
      echo "   where your tif image is stored. This is also where you'd like the output."
      echo "Exiting."
      exit 1
fi
if [ -z "$image" ]
then
      echo "-i flag for image name is empty and must be set. Provide the name of the image."
      echo "Exiting."
      exit 1
fi
is_image_installed=$(docker images -q tumgis/ctb-quantized-mesh)
if [ -z $is_image_installed ]
then
      echo "The docker image tumgis/ctb-quantized-mesh has not been installed."
      echo "Please run: sudo docker pull tumgis/ctb-quantized-mesh"
      echo "Exiting."
      exit 1
fi


job_name=ctb-tile-creation

# spin up a container with the ctb-quantized-mesh image
docker run -d --name $job_name -v $directory:/data tumgis/ctb-quantized-mesh tail -f /dev/null

# create the output directories
docker exec -it $job_name mkdir -p terrain_$image
docker exec -it $job_name mkdir -p png_$image

# convert the tif image to terrain mesh and png images
docker exec -it $job_name ctb-tile -f Mesh -C -N -o terrain_$image $image
docker exec -it $job_name ctb-tile -f PNG -C -N -o png_$image $image

# now that we're done, stop and destroy the container so we're not using up resources
docker stop $job_name
docker rm $job_name

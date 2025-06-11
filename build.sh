#!/bin/bash

# Script to stop/remove container, remove image, rebuild, and run Tic-Tac-Toe app

# Variables
CONTAINER_NAME="tictactoe"
IMAGE_NAME="tictactoe-app"
PORT_MAPPING="8080:80"

# Function to stop and remove container and image
stop_and_clean() {
    # Stop the container if it is running
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo "Stopping container $CONTAINER_NAME..."
        docker stop $CONTAINER_NAME
    fi

    # Remove the container if it exists
    if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
        echo "Removing container $CONTAINER_NAME..."
        docker rm $CONTAINER_NAME
    fi

    # Remove the image if it exists
    if [ "$(docker images -q $IMAGE_NAME)" ]; then
        echo "Removing image $IMAGE_NAME..."
        docker rmi $IMAGE_NAME
    fi

    # Remove dangling images
    echo "Cleaning up dangling images..."
    docker image prune -f
}

# Check for 'stop' argument
if [ "$1" = "stop" ]; then
    stop_and_clean
    exit 0
fi

# Normal operation (no arguments)
stop_and_clean

# Rebuild the Docker image
echo "Building image $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Build successful. Running container $CONTAINER_NAME..."
    docker run -d -p $PORT_MAPPING --name $CONTAINER_NAME $IMAGE_NAME
    if [ $? -eq 0 ]; then
        echo "Container $CONTAINER_NAME is running. Access it at http://localhost:8080"
    else
        echo "Failed to run container $CONTAINER_NAME. Check logs with 'docker logs $CONTAINER_NAME'."
    fi
else
    echo "Build failed. Please check the Dockerfile and files in the current directory."
fi


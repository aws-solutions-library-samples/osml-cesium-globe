import argparse
import datetime
import docker
import os
import subprocess
import sys

# Constants
DOCKER_IMAGE: str = os.getenv('DOCKER_IMAGE', "tumgis/ctb-quantized-mesh:alpine")
JOB_NAME: str = os.getenv('JOB_NAME', "ctb-tile-creation")
DEFAULT_START_ZOOM: int = int(os.getenv('DEFAULT_START_ZOOM', "12"))
DEFAULT_END_ZOOM: int = int(os.getenv('DEFAULT_END_ZOOM', "0"))

client = docker.from_env()


def log(message: str) -> None:
    """
    Log an informational message with the current timestamp.

    :param message: The message to be logged.
    :return: None
    """
    print(f"{datetime.datetime.now().strftime('%Y-%m-%d %T')} [INFO] {message}")


def error_exit(message: str) -> None:
    """
    Log an error message with the current timestamp and exit the script.

    :param message: The error message to be logged.
    :return: None
    """
    print(f"{datetime.datetime.now().strftime('%Y-%m-%d %T')} [ERROR] {message}", file=sys.stderr)
    sys.exit(1)


def cleanup() -> None:
    """
    Cleanup resources by stopping and removing the Docker container if it exists.

    :return: None
    """
    log("Cleaning up resources...")
    try:
        container = client.containers.get(JOB_NAME)
        container.stop()
        container.remove()
    except docker.errors.NotFound:
        pass


def main(directory: str, image: str, start_zoom: int, end_zoom: int) -> None:
    """
    Main function to process the image conversion using Docker.

    :param directory: The directory containing the image files.
    :param image: The image file name to be converted.
    :param start_zoom: The zoom level to start the conversion at.
    :param end_zoom: The zoom level to end the conversion at.
    :return: None
    """
    # Validate inputs
    if not directory or not image:
        error_exit("Directory or image name not specified.")
    if not os.path.isdir(directory):
        error_exit(f"Directory {directory} does not exist.")
    if not os.path.isfile(os.path.join(directory, image)):
        error_exit(f"Image {image} does not exist in {directory}.")
    if end_zoom < 0:
        error_exit("End zoom must be >= 0.")
    if end_zoom > start_zoom:
        error_exit("End zoom must be <= start zoom.")

    image_name, _ = os.path.splitext(image)
    # timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    terrain_output_folder = f"terrain_{image_name}"

    # Check Docker image
    try:
        client.images.get(DOCKER_IMAGE)
    except docker.errors.ImageNotFound as e:
        print(e)
        error_exit(f"Docker image {DOCKER_IMAGE} not installed. Please run: docker pull {DOCKER_IMAGE}")

    # Start Docker container
    try:
        log("Starting the conversion process...")
        container = client.containers.run(DOCKER_IMAGE, "tail -f /dev/null", name=JOB_NAME, detach=True,
                                          volumes={directory: {'bind': '/data', 'mode': 'rw'}})

        # Process image
        exec_command = lambda cmd: container.exec_run(cmd, tty=True)

        exec_command(f"mkdir -p {terrain_output_folder}")
        exec_command(f"ctb-tile -v -f Mesh -R -C -N -s {start_zoom} -e {end_zoom} -o {terrain_output_folder} {image}")
        exec_command(f"ctb-tile -v -f Mesh -l -C -N -s {start_zoom} -e {end_zoom} -o {terrain_output_folder} {image}")

    except docker.errors.ContainerError as e:
        error_exit(f"Error occurred: {e}")

    finally:
        # Cleanup
        cleanup()
        log("Conversion process completed successfully.")

    # Unzip terrain data
    log("Unzipping terrain data...")
    unzip_cmd = (f"find {os.path.join(directory, terrain_output_folder)} -type f -name '*.terrain' -exec bash -c 'mv "
                 f"\"$0\" \"$0.gz\" && gunzip \"$0.gz\"' {{}} \\;")
    subprocess.run(unzip_cmd, shell=True, check=True)
    log("Unzipping terrain data completed successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert image files to terrain mesh using Docker.")
    parser.add_argument("-d", "--directory", required=True, help="Directory containing the image files")
    parser.add_argument("-i", "--image", required=True, help="Image file name to be converted")
    parser.add_argument("-s",
                        "--start-zoom",
                        required=False,
                        type=int,
                        default=DEFAULT_START_ZOOM,
                        help="specify the zoom level to start at. This should be greater than the end zoom level.")
    parser.add_argument("-e",
                        "--end-zoom",
                        required=False,
                        type=int,
                        default=DEFAULT_END_ZOOM,
                        help="Specify the zoom level to end at. This should be less than the start zoom level and >= 0.")

    args = parser.parse_args()

    try:
        main(args.directory, args.image, args.start_zoom, args.end_zoom)
    except KeyboardInterrupt:
        error_exit("Script interrupted by user")

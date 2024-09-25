# OSML Cesium Globe

This project was bootstrapped with [ViteJs](https://vitejs.dev/). Build a way to visualize and display results from our image
processing workflow.

### Table of Contents
1. [Getting Started](#getting-started)
    1. [Prerequisites](#prerequisites)
    2. [Installation Guide](#installation-guide)
    3. [Run OSML Cesium Globe](#run-osml-cesium-globe)
2. [Support & Feedback](#support--feedback)
3. [Resources](#resources)
4. [License](#license)


## Getting Started
### Prerequisites:

First, ensure you have installed the following tools locally

- [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [node](https://nodejs.org/en)
- [docker](https://docs.docker.com/desktop/install/)
- [osml model runner](https://github.com/aws-solutions-library-samples/osml-model-runner) service is running in your aws account

### Installation Guide


1. Then pull in the `cesium-globe` package:
   ```sh
   git clone https://github.com/aws-solutions-library-samples/osml-cesium-globe.git
   ```
   or if you don't have a GitHub SSH key configured:
   ```sh
   git clone https://github.com/aws-solutions-library-samples/osml-cesium-globe.git
   ```
2. Install all the packages that is listed in `package.json` (or anytime you make changes to `package.json` file)
     ```sh
     npm install
     ```
3. Pull `tumgis/ctb-quantized-mesh:alpine` Docker container for Cesium Terrain Builder with quantized-mesh format support.
     ```sh
     docker pull tumgis/ctb-quantized-mesh:alpine
     ```

### Run OSML Cesium Globe
1. Load up your AWS credentials into your terminal by using this [guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
2. To deploy, execute:
   ```sh
   npm run dev
   ```

**Note** If you want to clean up the builds, node_modules, etc... execute:
   ```sh
   npm run clean
   ```

## Support & Feedback

OSML Cesium Globe is maintained by AWS Solution Architects. It is not part of an AWS service and support is provided
best-effort by the OSML community.

To post feedback, submit feature ideas, or report bugs, please use the Issues section of this GitHub repo.

If you are interested in contributing to OSML Cesium Globe, see the [CONTRIBUTING](CONTRIBUTING.md) guide.

## Resources

- [Amazon CloudScape UI](https://cloudscape.design/)
- [Cesium](https://cesium.com/platform/cesiumjs/)
- [AWS SDK V3](https://github.com/aws/aws-sdk-js-v3)

## License

MIT No Attribution Licensed. See [LICENSE](LICENSE).

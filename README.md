# 🌏 osml-cesium-globe

This project was bootstrapped with [ViteJs](https://vitejs.dev/)

Build a way to visualize and display results from our image processing workflow.

## ⚙️ Initial Setup

1. Install missing packages, brew, npm

- Install Brew

  ```sh
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

- Once brew is installed, then install npm

  ```sh
  brew install node
  ```

- Then install `cesium` plugin package (may not be needed -- remove if confirmed)

  ```sh
  npm i cesium vite-plugin-cesium -D
  ```

- Install all the packages that is listed in `package.json` (or anytime you make changes to `package.json` file)

  ```sh
  npm install
  ```

1. Load your AWS credentials

```sh
aws configure
```

1. To deploy or test changes, execute:

```sh
npm run dev
```

### Useful Commands

- Deploy and Run
  - `npm run dev`
- Clean the builds, node_modules, etc
  - `npm run clean`

### ? FAQs

- Where does it pull the AWS Credentials?
  - At this stage, it is designed to fetch AWS credentials from `~/.aws/credentials`

### 📂 Resources / Tips

- [Amazon CloudScape UI](https://cloudscape.design/)
- [Cesium](https://cesium.com/platform/cesiumjs/)
- [AWS SDK V3](https://github.com/aws/aws-sdk-js-v3) - This is a bit different, but I recommend installing individual packages.
  - If you want S3, do `npm i @aws-sdk/client-s3`, you can check if the service exist on [npm](https://www.npmjs.com/)

- [dependencies vs devDependencies](https://github.com/electron-vite/vite-plugin-electron-renderer#dependencies-vs-devdependencies)
- [C/C++ addons, Node.js modules - Pre-Bundling](https://github.com/electron-vite/vite-plugin-electron-renderer#dependency-pre-bundling)

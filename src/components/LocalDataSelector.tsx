// Copyright 2023-2024 Amazon.com, Inc. or its affiliates.

import { Autosuggest } from "@cloudscape-design/components";
import fs from "fs/promises";
import path from "path";

import { LOCAL_GEOJSON_FOLDER } from "@/config";

interface File {
  value: string;
}

interface Props {
  localFile: string;
  setLocalFile: (file: string) => void;
}

class LocalDataSelector {
  constructor(props: Props) {
    this.localFile = props.localFile;
    this.setLocalFile = props.setLocalFile;
  }

  localFile: string;

  setLocalFile: (file: string) => void;

  async getFileOptions(): Promise<File[]> {
    try {
      const files = await fs.readdir(LOCAL_GEOJSON_FOLDER);
      return files
        .filter((file) => this.isValidFile(file))
        .map((file) => ({ value: file }));
    } catch (error) {
      console.error("Error loading files", error);
      throw error;
    }
  }

  isValidFile(file: string) {
    // validation logic
  }

  render() {
    // component display logic
  }
}

export default LocalDataSelector;

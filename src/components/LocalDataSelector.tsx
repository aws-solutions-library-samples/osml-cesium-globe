import {Autosuggest} from "@cloudscape-design/components";
import fs from "fs";
import {LOCAL_GEOJSON_FOLDER} from "@/config";

const LocalDataSelector = ({localFile, setLocalFile}: { localFile: any, setLocalFile: any }) => {
    const fileList = fs
        .readdirSync(LOCAL_GEOJSON_FOLDER)
        .filter((file) => fs.lstatSync(LOCAL_GEOJSON_FOLDER + file).isFile());

    let localFileList: any = [];

    fileList.forEach((file) => {
        const extension = file.split('.').pop();
        if (extension == 'geojson' || extension == 'json') {
            localFileList.push({value: file});
        }
    });

    return (
        <Autosuggest
            onChange={({detail}) => {
                if (detail.value) {
                    setLocalFile(detail.value);
                }
            }}
            value={localFile}
            options={localFileList}
            enteredTextLabel={value => `Use: "${value}"`}
            ariaLabel="File Selection"
            placeholder="File"
            empty="No files loaded"
        />
    );
};

export default LocalDataSelector;

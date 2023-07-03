import {Globe, Scene, Viewer} from 'resium'
import OsmlMenu from '@/components/OsmlMenu'
import ImageRequestStatus from "@/components/ImageRequestStatus";
import "./styles.css"
import * as React from "react";
import * as Cesium from "cesium";

function App() {
    const [imageRequestStatus, setImageRequestStatus] = React.useState({state: "idle", data: {}});
    return (
    <Viewer full>
        <OsmlMenu imageRequestStatus={imageRequestStatus} setImageRequestStatus={setImageRequestStatus}/>
        <ImageRequestStatus imageRequestStatus={imageRequestStatus} setImageRequestStatus={setImageRequestStatus}/>
    </Viewer>
  )
}

export default App


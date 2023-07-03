import {useState} from 'react';
import {Button} from "@cloudscape-design/components";
import Icon from "@cloudscape-design/components/icon";
import ImageRequestModal from "./modal/ImageRequestModal"


const NewRequestButton = ({
                              imageRequestStatus,
                              setImageRequestStatus,
                              showCredsExpiredAlert,
                              setShowCredsExpiredAlert
                          }: {
    imageRequestStatus: any, setImageRequestStatus: any,
    showCredsExpiredAlert: any, setShowCredsExpiredAlert: any
}) => {
    const [showImageRequestModal, setShowImageRequestModal] = useState(false);

    return (
        <div>
            <div style={{position: "absolute", top: 10, left: 100}}>
                <Button
                    onClick={() => setShowImageRequestModal(true)}
                    variant="primary"
                >
                    <Icon name="add-plus"/>
                </Button>
            </div>

            <ImageRequestModal showImageRequestModal={showImageRequestModal}
                               setShowImageRequestModal={setShowImageRequestModal}
                               imageRequestStatus={imageRequestStatus}
                               setImageRequestStatus={setImageRequestStatus}
                               showCredsExpiredAlert={showCredsExpiredAlert}
                               setShowCredsExpiredAlert={setShowCredsExpiredAlert}/>
        </div>
    );
};

export default NewRequestButton;

import FileType from "../../object/FileType";

import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FileTypeIconProps {
    type: FileType;
    color: string;
}

export default function FileTypeIcon(props: FileTypeIconProps) {
    switch (props.type) {
        case FileType.FILE:
            return <FontAwesomeIcon icon={faFile} className='namespace-icon' color={props.color} />
        case FileType.FOLDER:
            return <FontAwesomeIcon className='namespace-icon' icon={faFolder} color={props.color} />
        default:
            throw new Error("Unknown File Type");
    }
}
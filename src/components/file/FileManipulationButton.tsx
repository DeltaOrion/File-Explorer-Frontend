import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FileManipulationButtonProps {
    onClick: () => void;
    color: string;
}

export default function FileManipulationButton(props: FileManipulationButtonProps) {
    return (
        <button className='file-dropdown-button'>
            <FontAwesomeIcon className='file-dropdown-button-image' onClick={props.onClick} color={props.color} icon={faEllipsisV} />
        </button>
    )
}
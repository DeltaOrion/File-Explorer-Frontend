import FileSystem from "../../object/FileSystem";

interface FileManipulationModalProps {
    isOpen: boolean;
    onSelect(workingDirectory: FileSystem, file: FileSystem): void;
}

export default function FileManipulationModal() {

}
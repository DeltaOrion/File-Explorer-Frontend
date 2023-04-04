import {
  faFileImport,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import FileType from "../../object/FileType";
import iFile from "../../object/iFile";
import InlineEditable from "../generic/InlineEditable";
import FileManipulationButton from "./FileManipulationButton";
import FileManipulationDropdown, {
  ManipulationElement,
} from "./FileManipulationDropdown";
import FileTypeIcon from "./FileTypeIcon";
import FileSystem from "../../object/FileSystem";
import { useToast } from "@chakra-ui/react";
import { rename } from "fs";

interface FileDisplayProps {
  file: iFile;
  parent: FileSystem;
  setWorkingDirectory: (append: string) => void;
  rename?: boolean;
}

function FileDisplay(props: FileDisplayProps) {
  //use state for updating this displaky
  const [file, setFile] = useState<iFile>(props.file);
  const [editing, setEditing] = useState<boolean>(props.rename === undefined ? false : props.rename);
  const propagation = useRef(false);
  const toast = useToast();

  const editableRef = useRef<HTMLDivElement>(null);

  //when the user clicks if it is a directory it should change the working directory
  const onClicked = (event: React.MouseEvent) => {
    if (file.type == FileType.FOLDER) {
      //If the user is editing and the click on the editable
      //it should not move to the next folder
      if (propagation.current) {
        propagation.current = false;
        return;
      }

      if (editing) return;

      handleDirectoryClick(file, props.setWorkingDirectory);
    } else {
      handleFileClick(file);
    }
  };

  const onRenameFinish = (
    value: string,
    mouseDown: boolean
  ): Promise<boolean> => {
    //perform client side validation on the name
    if (mouseDown) propagation.current = true;
    return new Promise<boolean>((resolve, reject) => {
      props.parent
        .renameFile(file.name, value)
        .then((fileSystem) => {
          file.name = fileSystem.getName();
          resolve(true);
        })
        .catch((error) => {
          toast({
            title: "Unable to rename file.",
            description: error,
            status: "error",
            duration: 2000,
            isClosable: true,
          });
          resolve(false);
        })
        .finally(() => {
          setEditing(false);
        });
    });
  };

  return (
    <div className="file-panel">
      <div className="file-info" onClick={onClicked}>
        {/* Left side is the namespace - icon + name */}
        <div className="file-namespace">
          <div className="icon-container">
            <FileTypeIcon color="#CAD1D8" type={file.type} />
          </div>
          <div ref={editableRef} className="file-name-container">
            <InlineEditable
              initialText={file.name}
              editing={editing}
              className="file-name"
              onConfirm={onRenameFinish}
            />
          </div>
        </div>
        {/* Right side is metadata about the folder, date created + size */}
        <div className="file-meta">
          <p className="meta-text">{toHumanReadable(file.size)}</p>
          <p className="meta-text">{`${file.lastModified.toLocaleDateString()}`}</p>
        </div>
      </div>
      <FileManipulationDropdown
        button={(onClicked) => {
          return <FileManipulationButton onClick={onClicked} color="#CAE1D8" />;
        }}
        elements={getElements(file, setFile, setEditing)}
      />
    </div>
  );
}

function getElements(
  file: iFile,
  setFile: (file: iFile) => void,
  setEditing: (editing: boolean) => void
): ManipulationElement[] {
  const elements: ManipulationElement[] = [
    //element to rename a file
    {
      action: () => {
        setEditing(true);
      },
      name: "Rename",
      icon: faPen,
    },
    {
      action: () => {},
      name: "Move",
      icon: faFileImport,
    },
    {
      action: () => {},
      name: "Delete",
      icon: faTrash,
    },
  ];

  return elements;
}

export function toHumanReadable(size: number): string {
  //convert bytes to human readable size
  let exponent = 1;
  const nextB = 1024;
  //loop until the file is greater than the next file size
  //or we are out of possible file sizes.
  while (size >= nextB && exponent < 5) {
    size = size / nextB;
    exponent++;
  }

  size = Math.floor(size);

  return `${size}${powerToSymbol(exponent)}B`;
}

function powerToSymbol(power: number): string {
  switch (power) {
    case 1:
      return "";
    case 2:
      return "K";
    case 3:
      return "M";
    case 4:
      return "G";
    default:
      return "T";
  }
}

export default FileDisplay;

function handleDirectoryClick(
  file: iFile,
  setWorkingDirectory: (append: string) => void
) {
  setWorkingDirectory(file.name);
}
function handleFileClick(file: iFile) {}

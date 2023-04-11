import { useToast } from "@chakra-ui/react";
import {
  faFileImport,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import FileSystem from "../../object/FileSystem";
import iFile from "../../object/iFile";
import InlineEditable from "../generic/InlineEditable";
import FileManipulationButton from "./FileManipulationButton";
import FileManipulationDropdown, {
  ManipulationElement,
} from "./FileManipulationDropdown";
import FileTypeIcon from "./FileTypeIcon";

interface FileDisplayProps {
  file: iFile;
  parent: FileSystem;
  onClicked(
    event: React.MouseEvent,
    iFile: iFile,
    index: number,
    isPropagating: boolean,
    setPropagating: (prop: boolean) => void
  ): void;
  removeFile: (file: iFile) => void;
  rename?: boolean;
  selected: boolean;
  index: number;
}

function FileDisplay(props: FileDisplayProps) {
  //use state for updating this displaky
  const [file, setFile] = useState<iFile>(props.file);
  const [editing, setEditing] = useState<boolean>(
    props.rename === undefined ? false : props.rename
  );
  const propagation = useRef(false);
  const toast = useToast();

  const editableRef = useRef<HTMLDivElement>(null);

  //when the user clicks if it is a directory it should change the working directory
  const onClicked = (event: React.MouseEvent) => {
    props.onClicked(event, file,props.index, propagation.current, (bool: boolean) => {
      propagation.current = bool;
    });
  };

  //when the user clicks outside or presses enter
  const onRenameFinish = (
    value: string,
    mouseDown: boolean
  ): Promise<boolean> => {
    //perform client side validation on the name
    if (mouseDown) propagation.current = true;

    //try to rename from the server
    return new Promise<boolean>((resolve, reject) => {
      //rename the file in the parent directory
      props.parent
        .renameFile(file.name, value)
        .then((fileSystem) => {
          //if it succeeds update this name
          file.name = fileSystem.getName();
          resolve(true);
        })
        .catch((error) => {
          //if we get an error then spawn a toast bar instead
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
          //stop editing this tile
          setEditing(false);
        });
    });
  };

  const handleDelete = (promise: Promise<FileSystem>) => {
    promise
      .then((file) => {
        props.removeFile(file.asFile());
      })
      .catch((error) => {
        toast({
          title: "Unable to delete file.",
          description: error,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  return (
    <div className={`file-panel${props.selected ? " selected" : ""}`}>
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
        elements={getElements(
          file,
          props.parent,
          setFile,
          handleDelete,
          setEditing
        )}
      />
    </div>
  );
}

function getElements(
  file: iFile,
  fileSystem: FileSystem,
  setFile: (file: iFile) => void,
  handleDelete: (promise: Promise<FileSystem>) => void,
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
      action: () => {
        const promise = fileSystem.deleteFile(file.name);
        handleDelete(promise);
      },
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

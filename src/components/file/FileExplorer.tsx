import { Spinner } from "@chakra-ui/react";
import { Ref, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FileSystem from "../../object/FileSystem";
import FileType from "../../object/FileType";
import iFile from "../../object/iFile";
import FileDisplay from "./FileDisplay";
import ManipulationButton from "./ManipulationButton";
import PathDisplay from "./PathDisplay";
import { noAuto } from "@fortawesome/fontawesome-svg-core";

interface FileExplorerProps {
  system: FileSystem;
  workingDirectory: string[];
}

//represents the current working directory
interface FileSpace {
  fileSystem: FileSystem;
  loadedFiles: iFile[];
  error: boolean;
}

function FileExplorer(props: FileExplorerProps) {
  console.log("Re-Rendering");

  //set up default file space with props.

  let [fileSpace, setFileSpace] = useState<FileSpace>({
    fileSystem: props.system,
    loadedFiles: [],
    error: false,
  });

  let [loading, setLoading] = useState<boolean>(true);
  const editing = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  //functionality to set the working directory
  const setWorkingDirectory = (path: string) => {
    const currentPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;
    //if its backwards go back
    if (path === "..") {
      props.workingDirectory.pop();
      return;
    }

    props.workingDirectory.push(path);
    navigate(currentPath + "/" + path);
  };
  //load files in the current directory with the file system
  //this is potentially blocking so we should do async
  const loadFiles = async () => {
    setTimeout(() => {
      const loadedNode = getCurrentNode(fileSpace, props.workingDirectory);
      if (!loadedNode) {
        fileSpace.error = true;
        setLoading(false);
        return;
      }
      fileSpace.loadedFiles = [];
      //transfer all of the filesystem objects to actual files
      for (const file of loadedNode.getChildren()) {
        fileSpace.loadedFiles.push(file.asFile());
      }

      //sort all of the files by folder first
      //file second
      sortFiles(fileSpace.loadedFiles);
      fileSpace.error = false;
      setLoading(false);
    }, 1000);
  };

  const removeFile = (file: iFile) => {
    for (let i = 0; i < fileSpace.loadedFiles.length; i++) {
      if (fileSpace.loadedFiles[i].name === file.name) {
        fileSpace.loadedFiles.splice(i, 1);
        setFileSpace({ ...fileSpace });
        return;
      }
    }
  };

  //attach the function to the useEffect hook.
  //this should be called
  // - 1) at the start
  // - 2) when the location changes

  useEffect(() => {
    editing.current = null;
    setLoading(true);
    loadFiles();
  }, [location]);

  //logic to add a file or folder
  //file system can handle the logic to creating
  const createFile = () => {
    createNode(FileType.FILE);
  };

  const createFolder = () => {
    createNode(FileType.FOLDER);
  };

  //first create the node with the file system
  //then update the file browser accordingly

  const createNode = async (type: FileType) => {
    const promise = fileSpace.fileSystem
      .getNode(constructPath(props.workingDirectory))
      ?.createFile(type);
    if (!promise) return;

    promise
      .then((file) => {
        insertFile(fileSpace.loadedFiles, file.asFile());
        console.log("Set Editing State Change");
        editing.current = file.asFile().name;
        setFileSpace({ ...fileSpace });
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <section className="file-display">
      {/** Header with information such as the current working directory and
       * options to create files and directories
       *
       */}
      <div className="file-header">
        <div className="path-display-container">
          <PathDisplay path={props.workingDirectory} />
        </div>
        <div className="button-panel">
          <ManipulationButton backgroundColor="#606d7b" onClick={createFolder}>
            Create Directory
          </ManipulationButton>
          <ManipulationButton backgroundColor="#2563eb" onClick={createFile}>
            Create File
          </ManipulationButton>
        </div>
      </div>
      {/* Panel which displays all of the files
          Each file and folder gets its own clickable card */}
      <div className="file-grid">
        {
          //get panel depending on current state
          getGrid(
            fileSpace,
            loading,
            props.workingDirectory,
            setWorkingDirectory,
            editing.current,
            (val) => {
              editing.current = val;
            },
            removeFile
          )
        }
      </div>
    </section>
  );
}

function getGrid(
  fileSpace: FileSpace,
  loading: boolean,
  workingDirectory: string[],
  setWorkingDirectory: (path: string) => void,
  editing: string | null,
  setEditing: (val: string | null) => void,
  removeFile: (file: iFile) => void
): import("react").ReactNode {
  if (loading) {
    //if we are still loading return a loading spinner
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );
  }

  if (fileSpace.error) {
    //if there is any kind of error report that no files can be found
    return (
      <h1>{`Sorry! No files can be found at ${constructPath(
        workingDirectory
      )}`}</h1>
    );
  }

  //otherwise return the loaded files listed
  return fileSpace.loadedFiles.map((file, index, files) => {
    let isEditing = false;
    if (file.name == editing) {
      isEditing = true;
    }
    const node = getCurrentNode(fileSpace, workingDirectory);
    if (node) {
      return (
        <FileDisplay
          key={file.name}
          rename={isEditing}
          setWorkingDirectory={setWorkingDirectory}
          file={file}
          removeFile={removeFile}
          parent={node}
        />
      );
    }
  });
}

function getCurrentNode(
  fileSpace: FileSpace,
  workingDirectory: string[]
): FileSystem | null {
  const fileSystem = fileSpace.fileSystem.getNode(
    constructPath(workingDirectory)
  );
  if (!fileSystem) return null;

  return fileSystem;
}

function sortFiles(files: iFile[]): void {
  //Use modified version of quick sort parity
  //everything less than i is a folder
  let i = -1;
  //j is a pointer to the next file
  let j = 0;

  while (j < files.length) {
    if (files[j].type == FileType.FOLDER) {
      //if we find a folder move i forward and swap to ensure everything before is a folder
      i++;
      swap(files, j, i);
    }
    j++;
  }
}

export default FileExplorer;

function swap(files: iFile[], j: number, i: number) {
  const temp = files[i];
  files[i] = files[j];
  files[j] = temp;
}

function insertFile(loadedFiles: iFile[], file: iFile) {
  if (file.type === FileType.FILE) {
    loadedFiles.push(file);
    return;
  }

  let left = 0;
  let right = loadedFiles.length - 1;
  while (left <= right) {
    let middle = Math.floor((left + right) / 2);
    if (loadedFiles[middle].type === FileType.FOLDER) {
      // Insert the file here
      loadedFiles.splice(middle, 0, file);
      return;
    } else {
      right = middle - 1;
    }
  }
  loadedFiles.unshift(file);
}

function constructPath(workingDirectory: string[]): string {
  let path = "";
  for (let i = 0; i < workingDirectory.length; i++) {
    path = path + workingDirectory[i];
    if (i < workingDirectory.length - 1) {
      path = path + "/";
    }
  }

  return path;
}

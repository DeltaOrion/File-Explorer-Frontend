import { useLocation, useParams } from "react-router-dom";
import FileExplorer from "../components/file/FileExplorer";
import FileType from "../object/FileType";
import FileSystem from "../object/FileSystem";
import ObjectFileSystem from "../object/mock/ObjectFileSystem";

function getBase(): FileSystem {

    const root = new ObjectFileSystem();
    root.createFile(FileType.FOLDER, "folder1").then((folder1) => {
        folder1.createFile(FileType.FOLDER, "folder3").then(folder3 => {
            const file1 = folder3.createFile(FileType.FILE, "file1");
        })
        folder1.createFile(FileType.FOLDER, "folder4").then(folder4 => {
            const file2 = folder4.createFile(FileType.FILE, "file2");
        })
    });
    root.createFile(FileType.FOLDER, "folder2").then(folder2 => {
        folder2.createFile(FileType.FOLDER, "folder5");
        folder2.createFile(FileType.FILE, "file6.txt");
    })
    root.createFile(FileType.FOLDER,"Folder11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111").then((longFolder) => {
        longFolder.createFile(FileType.FILE,"file3");
    });
    
    root.createFile(FileType.FILE, 'file1.txt');
    root.createFile(FileType.FILE, 'file2.txt');
    root.createFile(FileType.FILE, 'file3.txt');
    return root;
  }

interface FileExplorerPageProps {
    currPath: string;
}

export default function FileExplorerPage(props: FileExplorerPageProps) {
    let rawPath = decodeURI(useLocation().pathname);
    rawPath = rawPath.substring(props.currPath.length,rawPath.length);

    if(rawPath.charAt(0)=='/') {
        rawPath = rawPath.substring(1);
    }

    if(rawPath.charAt(rawPath.length-1) == '/') {
        rawPath = rawPath.substring(0,rawPath.length-1);
    }

    let directory = rawPath.split('/');

    console.log(rawPath);
    if(directory.length===1 && directory[0] === "") {
        directory = [];
    }

    return (
        <div className='file-page'>
            <FileExplorer system={getBase()} workingDirectory={directory} />
        </div>
    )
}
import FileType from "./FileType";
import iFile from "./iFile";

interface FileSystem {
    getNode(path: string): FileSystem | null;
    getChildren(): FileSystem[];
    getPaths(): string[];
    asFile(): iFile;
    getName(): string
    createFile(type: FileType, name?: string): Promise<FileSystem>;
    renameFile(oldName: string, newName: string): Promise<FileSystem>;
    deleteFile(name: string): Promise<FileSystem>;
    updateFile(file: iFile): void;
    getParent(): FileSystem | null;
}

export const PATH_SEPERATOR: string = "/";

export default FileSystem;
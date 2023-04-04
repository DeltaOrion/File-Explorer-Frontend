import FileType from "./FileType";

interface File {
    type: FileType;
    name: string;
    lastModified: Date;
    //Size in bytes
    size: number;
}

export default File;
import FileType from "../FileType";
import iFile from "../iFile";
import FileSystem, { PATH_SEPERATOR } from "../FileSystem";
import { fileNameSchema } from "../FileValidators";

class ObjectFileSystem implements FileSystem {
  private root: FileNode;

  constructor(
    node: FileNode = new FileNode("/", new Date(), 0, FileType.FOLDER)
  ) {
    this.root = node;
  }
  public getNode(path: string): FileSystem | null {
    if (path == "/" || path == "") return this;

    return this.getNodeP(path.split(PATH_SEPERATOR));
  }

  private getNodeP(path: string[]): FileSystem | null {
    if (path.length == 0) {
      return this;
    }

    if (path[0] == "..") return this.getParent();

    for (const child of this.root.getChildren()) {
      if (child.getName() == path[0]) {
        path.shift();
        return new ObjectFileSystem(child).getNodeP(path);
      }
    }
    return null;
  }

  public getChildren(): FileSystem[] {
    let children: FileSystem[] = [];
    this.root.getChildren().forEach((child) => {
      children.push(new ObjectFileSystem(child));
    });

    return children;
  }

  public getPaths(): string[] {
    let children: string[] = [];
    this.root.getChildren().forEach((child) => {
      children.push(child.getName());
    });

    return children;
  }

  public asFile(): iFile {
    return this.root.asFile();
  }

  public getName(): string {
    return this.root.getName();
  }

  public async createFile(type: FileType, name?: string): Promise<FileSystem> {
    return new Promise<FileSystem>((resolve, reject) => {
      //generate a new name if one does not exist neccesary
      if (!name) {
        let baseName = "New Folder";
        if (type === FileType.FILE) {
          baseName = "New File";
        }
        name = this.generateName(baseName);
      }

      //check if a file already exists
      if(this.root.getChild(name)) {
        reject("A file with this name already exists");
        return;
      }

      //try validate the name
      const validation = fileNameSchema.validate(name);
      validation
        .then((value) => {
          //if the name was successful then create a new file node
          const created = new FileNode(
            value,
            new Date(),
            this.getRandomInt(10000000),
            type
          );
          this.root.addChild(created);
          resolve(new ObjectFileSystem(created));
        })
        .catch((errors) => {
          //otherwise reject with the errors
          reject(errors);
        });
    });
  }

  updateFile(file: iFile): void {
    const node = this.root.getChild(file.name);
    if (node == null) return;

    node.update(file);
  }

  public renameFile(oldName: string, newName: string): Promise<FileSystem> {
    //perform "server-side" validation
    return new Promise<FileSystem>(async (resolve,reject) => {
        const node = this.root.getChild(oldName);
        if(!node) {
            reject("This file does not exist");
            return;
        }

        const existingNode = this.root.getChild(newName);

        if(existingNode && existingNode != node) {
            reject("A file already exists with this name");
            return;
        }

        const validation = fileNameSchema.validate(newName);
        validation.then((value) => {
            node.setName(newName);
            resolve(new ObjectFileSystem(node));
        }).catch((errors) => {
            reject(errors);
        })
    });
  }

  deleteFile(name: string): Promise<FileSystem> {
    return new Promise((resolve,reject) => {
      const node = this.root.removeChild(name);
      if(!node) {
          reject("This file does not exist");
          return;
      }

      resolve(new ObjectFileSystem(node));
    });
  }

  private rename(oldName: string, newName: string): void {
    //find the file
    const file = this.root.getChild(oldName);
    if (!file) throw new Error("Unknown File");

    //check for any collisions
    const collision = this.root.getChild(newName);
    if (collision) throw new Error("A file with this name already exists");

    //rename the file
    file.setName(newName);
  }
  public getParent(): FileSystem | null {
    const parent = this.root.getParent();
    if (parent) return new ObjectFileSystem(this.root);

    return null;
  }

  private getRandomInt(x: number) {
    return Math.floor(Math.random() * x) + 1;
  }

  private generateName(baseName: string): string {
    let highestNum = 0;
    for (const file of this.root.getChildren()) {
      if (file.getName().startsWith(baseName)) {
        const num = this.getEndingNum(file.getName());
        if (num && num > highestNum) {
          highestNum = num;
        }
      }
    }

    highestNum = highestNum + 1;
    return `${baseName}_${highestNum}`;
  }

  private getEndingNum(name: String): number | undefined {
    const split = name.split("_");
    if (split.length > 1) {
      const num = split[1];
      return parseInt(num);
    }
  }
}

class FileNode {
  private name: string;
  private lastModified: Date;
  private size: number;
  private type: FileType;
  private parent: FileNode | null;
  private children: FileNode[];

  public constructor(
    name: string,
    lastModified: Date,
    size: number,
    type: FileType
  ) {
    this.name = name;
    this.lastModified = lastModified;
    this.size = size;
    this.type = type;
    this.children = [];
    this.parent = null;
  }

  public addChild(node: FileNode): void {
    node.parent = this;
    this.children.push(node);
  }

  public getChild(name: string): FileNode | null {
    for (const node of this.children) {
      if (node.name === name) {
        return node;
      }
    }
    return null;
  }

  public removeChild(name: string): FileNode | null {
    for(let i=0;i<this.children.length;i++) {
      const node = this.children[i];
      if(node.getName() == name) {
        this.children.splice(i,1);
        return node;
      }
    }

    return null;
  }

  public getChildren(): FileNode[] {
    return this.children;
  }

  public asFile(): iFile {
    return {
      name: this.name,
      lastModified: this.lastModified,
      size: this.size,
      type: this.type,
    };
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getParent(): FileNode | null {
    return this.parent;
  }

  public update(file: iFile) {
    this.lastModified = file.lastModified;
    this.size = file.size;
  }
}

export default ObjectFileSystem;

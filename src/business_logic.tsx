import { open } from "@tauri-apps/api/dialog";
import { appDataDir } from "@tauri-apps/api/path";


import { FileContent } from "./dataStructures";

export const fileSelector = async () => {
    const selected = await open({
        directory: false,
        multiple: false,
        defaultPath: await appDataDir()
    });
    return selected;
}


export const folderSelector = async () => {
    const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: await appDataDir()
    });
    return selected;
}

export function* compondIterator(func: any, compoundList: FileContent[]) {
    let i = 0;
    while (compoundList.length !== i) {
        let toReturn = compoundList[i];
        i += 1;
        func(i);
        yield toReturn;
    }
}


export function synonymBuilder(name: string, synonyms: string[]): string {
    let syns = synonyms.filter((x) => x !== name);
    return syns.join("#");
}



export interface FileContent {
    id: string,
    compound_name: string,
    inchi_key: string,
}


export interface PubchemData {
    name: string,
    smiles: string,
    synonyms: string[]
}



export interface CleanedData {
    id: string,
    compound_name: string,
    inchi_key: string,
    synonyms: string,
    previous_name: string,
}

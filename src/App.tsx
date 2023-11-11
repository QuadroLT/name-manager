import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/tauri";

import { Container, Button, InputGroup, Form, Row, Col, ProgressBar } from "react-bootstrap";
import { compondIterator, fileSelector, folderSelector, synonymBuilder } from "./business_logic";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder, faSave, faPlay } from "@fortawesome/free-solid-svg-icons";

import { Selector } from "./components/NameSelector";
import { DrawMolecule } from "./components/StructureDraw";
import { MoleculeRepresentationProps } from "@iktos-oss/molecule-representation";
import "bootstrap/dist/css/bootstrap.min.css";
import { FileContent, PubchemData, CleanedData } from "./dataStructures";

const fileIcon = <FontAwesomeIcon icon={faFile} />;
const folderIcon = <FontAwesomeIcon icon={faFolder} />;
const saveIcon = <FontAwesomeIcon icon={faSave}/>;
const startIcon = <FontAwesomeIcon icon={faPlay} />;


function App() {
    const [sourceIconColor, setSourceIconColor] = useState({ 'color': 'red' });
    const [destFolderColor, setDestFolderColor] = useState({'color':'red'});
    const [sepColor, setSepColor] = useState({'color':'red'});
    const [sourceFile, setSourceFile] = useState('');
    const [destFolder, setDestFolder] = useState('');
    const [destFile, setDestFile] = useState('');
    const [startDisabled, setStartDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true)
    const [retryDisabled, setRetryDisabled] = useState(true);
    const [saveDisabled, setSaveDisabled] = useState(true);
    const [data, setData] = useState<FileContent[]>([]);
    const [compoundGenerator, setCompoundGenerator] = useState<Generator<FileContent | undefined, void, unknown>>()
    const [progress, setProgress] = useState(0)
    /* const [currentCompound, setCurrentCompound] = useState<FileContent>({
*     Id: "",
*     CompoundName: "",
*     InChIKey: ""
* }); */
    const [currentName, setCurrentName] = useState("");
    const [currentInchi, setCurrentInchi] = useState("");
    const [currentId, setCurrentId] = useState("");
    const [pubchemCompound, setPubchemCompound] = useState<PubchemData>({
        name: "undefined",
        smiles: "",
        synonyms: []
    });
    const [finalData, setFinalData] = useState<CleanedData[]>([]);

    const [selectedName, setSelectedName] = useState("");

    const props: MoleculeRepresentationProps = {
        smiles: (pubchemCompound.smiles),
        height: 200,
        width: 300,
    };

    //  tauri functions

    const read_csv = () => {
        invoke('get_csv_content', {'path': sourceFile}).then(
            (d: any) => {
                let parsed: FileContent[] = JSON.parse(d);
                setData(parsed);
                setNextDisabled(false);
            }
        )
    }

    const get_compound_data = () => {
        invoke("fetch_compound", { 'inchi': currentInchi }).then((data: any) => {
            let parsed: PubchemData = JSON.parse(data);
            /* console.log(parsed) */
            if ((!parsed.synonyms.includes(currentInchi)) && (currentInchi !== "")){
                parsed.synonyms.push(currentInchi);
            }
            if ((!parsed.synonyms.includes(currentName)) && (currentName !== "")){
                parsed.synonyms.push(currentName);
            }
            if ((!parsed.synonyms.includes(parsed.name)) && (parsed.name !== "Does not exist")) {
                parsed.synonyms.push(parsed.name);
            }
            setPubchemCompound(parsed);
        });
    }

    const get_cleaned_data = () => {
        if(currentName !== "") {
            console.log("condition hit")
            let cleanData = {
                id: currentId,
                compound_name: selectedName,
                inchi_key: currentInchi,
                synonyms: synonymBuilder(selectedName, pubchemCompound.synonyms),
                previous_name: currentName
            };
            setFinalData((finalData) => [...finalData, cleanData]);
        };
        console.log(finalData)
    };

    const write_results = () => {
        get_cleaned_data();
        let data = JSON.stringify(finalData);
        console.log(data);
        invoke('write_data', {'path': destFolder, 'file': destFile, 'data':data});
    }
    // callbacks to clicks

    const handleUploadClick = (func1: any, func2: any) => {
        func1().then((data: any) => {
            func2(data);
        });
    }

    const handleNextCompoundClick = (compoundGenerator: any) => {
        get_cleaned_data();
        /* if (finalData.length == ) */
        console.log(finalData);
        let item = compoundGenerator.next();
        let comp: FileContent = item.value;
        if (item.done === true){
            setNextDisabled(true);
        }
        /* console.log(comp) */
        /* let comp = data.pop() */
        setCurrentName(comp.compound_name);
        /* console.log(currentName); */
        setCurrentInchi(comp.inchi_key);
        setCurrentId(comp.id);
        /* let parsed: PubchemData = get_compound_data1(); */
        /* setPubchemCompound(parsed) */
    };

    const handleRetryClick = () => {
        get_compound_data();
    };

    //  effects

    useEffect(() => {
        get_compound_data()
    }, [currentInchi, currentName],
    );

    useEffect(() => {
        if (pubchemCompound.name === "Does not exist"){
            setRetryDisabled(false);
        } else {
            setRetryDisabled(true);
        }
    }, [pubchemCompound.name],
    );

    useEffect(() => {
        if(data.length !== 0){
            const gen = compondIterator(setProgress, data)
            setCompoundGenerator(gen);
        }
    }, [data],
    )

    useEffect(() => {
        if (sourceFile !== ""){
            if (sourceFile.endsWith(".csv")){
                setSourceIconColor({"color": "green"});
                setStartDisabled(false);
            } else {
                setSourceIconColor({"color": "orange"});
            }
        }
    }, [sourceFile],
    );

    useEffect(() => {
        if (destFolder!==""){
            setDestFolderColor({'color': 'green'})
        }
    }, [destFolder],
    );

    useEffect(() => {
        if ((destFile !== "") && (destFile.endsWith(".csv"))) {
            setSepColor({ 'color': 'green' });
            setSaveDisabled(false)
        } else if (destFile !== "") {
            setSepColor({'color': 'orange'});
        }
    }, [destFile],
    );

    // main component

    return (
        <Container className="mt-5">
                    <InputGroup>
                        <Button onClick={() => handleUploadClick(fileSelector, setSourceFile)}>Upload CSV</Button>
                        <InputGroup.Text style={sourceIconColor}> {fileIcon} </InputGroup.Text>
                        <Form.Control type="text" placeholder="Please upload CSV" value={sourceFile} disabled />
                    </InputGroup>
                    <InputGroup>
                        <Button onClick={() => handleUploadClick(folderSelector, setDestFolder)}> Destination Path </Button>
                        <InputGroup.Text style={destFolderColor}> {folderIcon} </InputGroup.Text>
                        <Form.Control type="text" placeholder="Please type-in output file name" value={destFolder} disabled />
                        <InputGroup.Text style={sepColor}><b>/</b></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Please provide output filename"
                            value={destFile}
                            onChange={(e) => {
                                setDestFile(e.target.value)
                                }
                            } />
                    </InputGroup>
                    <div className="align-items-left mt-3">
                        <InputGroup>
                    <Button className="btn-warning" disabled={startDisabled} onClick={read_csv}>{startIcon} Start Process</Button>
                    <Button className="btn-success" disabled={saveDisabled} onClick={write_results} >{saveIcon} Save Results</Button>
                        </InputGroup>
                    </div>
                    <div className="mt-3">
                        <Row>
                    <Button onClick={ () => {
                        handleNextCompoundClick(compoundGenerator);}
                    }
                        className="col-2"
                        disabled={nextDisabled}
                    >Next compound</Button>
                    <Button className="btn-danger col-1" onClick={handleRetryClick} disabled={retryDisabled}>Retry</Button>
                    <ProgressBar now={progress} max={data.length} label={progress}  className="col-9" style={{ height: '2.5rem' }} />
                        <h3>Current compound: {currentName}, {currentInchi}</h3>
                        </Row>

                        <Row>
                            <Col className="col-4">
                                <DrawMolecule {...props} />
                                <p>PubChem Name: {pubchemCompound.name}</p>
                            </Col>
                            <Col className="col-8">
                                <h5>Suggested names</h5>
                                <Selector synonims={pubchemCompound.synonyms} name={selectedName}  setName={setSelectedName} />
                            </Col>
                        </Row>
                        <Row>
                        </Row>
                    </div>
            </Container>
    );
}

export default App;

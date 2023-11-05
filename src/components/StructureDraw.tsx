import { RDKitProvider } from "@iktos-oss/rdkit-provider";
/* import { useRDKitUtils, useRDKit } from "@iktos-oss/rdkit-provider"; */
/* import { useCallback } from "react"; */



import { MoleculeRepresentation, MoleculeRepresentationProps } from '@iktos-oss/molecule-representation';

export function DrawMolecule(props: MoleculeRepresentationProps) {
    return (
        <>
            <RDKitProvider cache={{ enableJsMolCaching: true, maxJsMolsCached: 30 }}>
                    <MoleculeRepresentation {...props} />
            </RDKitProvider>
        </>
    )
}

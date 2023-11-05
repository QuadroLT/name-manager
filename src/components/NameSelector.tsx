
import { Form } from "react-bootstrap";

type nameSelectorProps = {
    synonims: string[],
    name: string,
    setName: any
}

export function Selector({synonims, name, setName}: nameSelectorProps){

    const onOptionChange = (e:any) => {
        setName(e.target.value);
        console.log(name);
    }

    return (
        <>
            <Form id="name-form">
                {synonims.map(
                    (syn) =>
                        <Form.Check
                            key={`radio-${syn}`}
                            type="radio"
                            value={syn}
                            label={syn}
                            checked={ name===syn }
                            onChange={onOptionChange}
                        />)
                }
            </Form>
        </>
    );
}

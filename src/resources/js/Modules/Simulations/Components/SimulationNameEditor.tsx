import React, { useState } from "react";
import { Button, Input, InputGroup, InputGroupAddon } from "reactstrap";
import axios from "axios";
import route from "ziggy-js";

interface Props {
    simulation: {
        id: number;
        name: string;
    };
    update: boolean;
}

const SimulationNameEditor: React.FC<Props> = ({
    simulation,
    update,
}: Props) => {
    const [name, setName] = useState<string>(simulation.name);
    const [isEditorShown, setIsEditorShown] = useState(false);

    const handleUpdate = () => {
        const trimmedName = name.trim();
        if (trimmedName !== "") {
            axios
                .patch(route("simulations.updateName", simulation.id), {
                    name: trimmedName,
                })
                .catch((e) => {
                    console.error(e);
                });
        } else {
            setName(simulation.name);
        }
        setIsEditorShown(false);
    };

    return (
        <>
            {(!isEditorShown || !update) && (
                <>
                    <span>
                        {name}{" "}
                        {update && (
                            <Button
                                outline
                                color="success"
                                onClick={() => setIsEditorShown(true)}
                            >
                                <i className="fas fa-pencil-alt" />
                            </Button>
                        )}
                    </span>
                </>
            )}
            {isEditorShown && update && (
                <>
                    <InputGroup>
                        <Input
                            className="form-control bg-light text-dark"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUpdate();
                                }
                            }}
                        />
                        <InputGroupAddon addonType="prepend">
                            <Button onClick={() => handleUpdate()}>
                                <i className="fas fa-save" />
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </>
            )}
        </>
    );
};

export default SimulationNameEditor;

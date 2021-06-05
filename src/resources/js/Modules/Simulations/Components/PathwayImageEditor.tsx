/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Input,
    Label,
    Row,
    UncontrolledTooltip,
} from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "react-select2-wrapper/css/select2.css";
import PathwayImage from "../WikiPlugins/PathwayImage";

interface Props {
    simulation: number;
    pathway?: string;
    canEditPages: boolean;
    pathwaysToNames: Record<string, string>;
}

type Position = "left" | "center" | "right";

interface State {
    plugin: "@Simulations:PathwayImage";
    simulation: number;
    pathway?: string;
    legend: string;
    position: Position;
}

const PathwaysTableEditor: React.FC<Props> = ({
    simulation,
    pathway,
    canEditPages,
    pathwaysToNames,
}: Props) => {
    const [pluginCode, setPluginCode] = useState("");
    const [state, setState] = useState<State>({
        plugin: "@Simulations:PathwayImage",
        simulation,
        pathway,
        legend: pathway ? pathwaysToNames[pathway] : "",
        position: "center",
    });

    useEffect(() => {
        setPluginCode(`\`\`\`SciKi
${JSON.stringify(state, undefined, 2)}
\`\`\``);
    }, [setPluginCode, simulation, state]);

    return (
        <>
            <Row>
                <Col xs="12" xl={canEditPages ? 8 : 12}>
                    <PathwayImage {...state} />
                </Col>
                {canEditPages && (
                    <Col xs="12" xl="4">
                        <Card className="bg-gradient-dark shadow mb-2">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase text-light ls-1 mb-1">
                                    Edit Plugin
                                </h6>
                            </CardHeader>
                            <CardBody className="text-white-50">
                                <FormGroup>
                                    <Label for="input-legend">Legend</Label>
                                    <Input
                                        id="input-legend"
                                        type="text"
                                        value={state.legend}
                                        onChange={(e) =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                legend: e.target.value,
                                            }))
                                        }
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="input-position">Position</Label>
                                    <Input
                                        id="input-position"
                                        type="select"
                                        value={state.position}
                                        onChange={(e) =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                position: e.target
                                                    .value as Position,
                                            }))
                                        }
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </Input>
                                </FormGroup>
                            </CardBody>
                        </Card>
                        <Card className="bg-gradient-dark shadow">
                            <CardHeader className="bg-transparent">
                                <div className="d-flex flex-row justify-content-between align-items-center">
                                    <h6 className="text-uppercase text-light ls-1 mb-1">
                                        Get the code
                                    </h6>
                                    <CopyToClipboard text={pluginCode}>
                                        <Button
                                            className="btn btn-sm btn-link"
                                            id="get-code-tooltip"
                                            type="button"
                                        >
                                            <i className="fas fa-clipboard" />
                                        </Button>
                                    </CopyToClipboard>
                                    <UncontrolledTooltip
                                        delay={0}
                                        trigger="hover focus"
                                        target="get-code-tooltip"
                                    >
                                        Copy To Clipboard
                                    </UncontrolledTooltip>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <code className="text-wrap">
                                    <pre
                                        className="text-white-50"
                                        style={{
                                            maxHeight: "150px",
                                            overflowX: "auto",
                                        }}
                                    >
                                        {pluginCode}
                                    </pre>
                                </code>
                            </CardBody>
                        </Card>
                    </Col>
                )}
            </Row>
        </>
    );
};

export default PathwaysTableEditor;

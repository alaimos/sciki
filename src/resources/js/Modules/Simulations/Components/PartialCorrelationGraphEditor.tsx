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
import { filterByKey } from "../../../Common/utils";
import PartialCorrelationGraph from "../WikiPlugins/PartialCorrelationGraph";
import { useDispatcherEventWithSender } from "../../../Hooks/useDispatcherEvent";
import { SelectedSimulation } from "../WikiPlugins/CorrelationGraph";

interface Props {
    simulation: number;
    canEditPages: boolean;
    correlationGraphId?: string;
}

type Correlation = "pearson" | "spearman";
type Direction = "positive" | "negative" | "both";

interface State {
    plugin: "@Simulations:PartialCorrelationGraph";
    id?: string;
    simulation: number;
    compareWith?: number;
    fn: Correlation;
    top: boolean;
    n: number;
    direction: Direction;
    useEndpoints: boolean;
    usePerturbation: boolean;
    title: string;
    height: number;
    connectedTo?: string;
}

const CorrelationGraphEditor: React.FC<Props> = ({
    simulation,
    canEditPages,
    correlationGraphId,
}: Props) => {
    const [pluginCode, setPluginCode] = useState("");
    const [connected, setConnected] = useState(false);
    const [state, setState] = useState<State>({
        plugin: "@Simulations:PartialCorrelationGraph",
        id: `partial-corr-graph-${Math.random().toString(36).substr(2, 10)}`,
        simulation: simulation,
        fn: "pearson",
        top: false,
        n: 10,
        direction: "negative",
        useEndpoints: true,
        usePerturbation: false,
        title: "",
        height: 600,
    });

    useDispatcherEventWithSender<SelectedSimulation>(
        "onCorrelationGraphBarClick",
        (selection) => {
            setState((prevState) => ({
                ...prevState,
                ...filterByKey(selection, (k) => k !== "sender"),
            }));
        },
        correlationGraphId,
        [setState]
    );

    useEffect(() => {
        const tmpState = filterByKey(
            state,
            (k) =>
                !connected ||
                ![
                    "compareWith",
                    "fn",
                    "useEndpoints",
                    "usePerturbation",
                ].includes(k)
        );
        if (connected) {
            tmpState["connectedTo"] = correlationGraphId;
        }
        setPluginCode(`\`\`\`SciKi
${JSON.stringify(tmpState, undefined, 2)}
\`\`\``);
    }, [setPluginCode, simulation, state, connected, correlationGraphId]);

    return (
        <>
            <Row>
                <Col xs="12" xl="8">
                    <PartialCorrelationGraph
                        {...state}
                        connectedTo={correlationGraphId}
                    />
                </Col>
                <Col xs="12" xl="4" className="d-flex flex-column">
                    <Card className="bg-gradient-dark shadow mb-2 flex-grow-1">
                        <CardHeader className="bg-transparent">
                            <h6 className="text-uppercase text-light ls-1 mb-1">
                                Change your graph
                            </h6>
                        </CardHeader>
                        <CardBody className="text-white-50">
                            <FormGroup>
                                <Label for="input-title-pcorr">Title</Label>
                                <Input
                                    id="input-title-pcorr"
                                    type="text"
                                    value={state.title}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="input-height-pcorr">Height</Label>
                                <Input
                                    id="input-height-pcorr"
                                    type="number"
                                    value={state.height}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            height: +e.target.value,
                                        }))
                                    }
                                />
                            </FormGroup>
                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    className="custom-control-input"
                                    id="check-is-connected"
                                    checked={connected}
                                    type="checkbox"
                                    onChange={(e) =>
                                        setConnected(e.target.checked)
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="check-is-connected"
                                >
                                    {`Link to the correlation graph?${
                                        canEditPages
                                            ? ` (If you
                                    enable this option do not close the page
                                    until you copied the code for both
                                    correlation graph and detail graph).`
                                            : ""
                                    }`}
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    className="custom-control-input"
                                    id="check-top-n-pcorr"
                                    checked={state.top}
                                    type="checkbox"
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            top: e.target.checked,
                                        }))
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="check-top-n-pcorr"
                                >
                                    Show only the top-N results?
                                </label>
                            </div>
                            {state.top && (
                                <>
                                    <FormGroup>
                                        <Label for="input-number-pcorr">
                                            Number of top results
                                        </Label>
                                        <Input
                                            id="input-number-pcorr"
                                            type="number"
                                            value={state.n}
                                            onChange={(e) =>
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    n: +e.target.value,
                                                }))
                                            }
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="input-direction-pcorr">
                                            Direction
                                        </Label>
                                        <Input
                                            id="input-direction-pcorr"
                                            type="select"
                                            value={state.direction}
                                            onChange={(e) =>
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    direction: e.target
                                                        .value as unknown as Direction,
                                                }))
                                            }
                                        >
                                            <option value="both">Both</option>
                                            <option value="positive">
                                                Top-N positive
                                            </option>
                                            <option value="negative">
                                                Top-N negative
                                            </option>
                                        </Input>
                                    </FormGroup>
                                </>
                            )}
                        </CardBody>
                    </Card>
                    {canEditPages && (
                        <Card className="bg-gradient-dark shadow flex-grow-1">
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
                    )}
                </Col>
            </Row>
        </>
    );
};

export default CorrelationGraphEditor;

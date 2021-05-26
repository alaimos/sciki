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
import SimulationHeatmap from "../../Wiki/Plugins/Modules/Simulations/SimulationHeatmap";

interface Props {
    simulation: number;
    canEditPages: boolean;
    selectedPathways: string[];
    selectedNodes: Record<string, string[]>;
}

interface State {
    plugin: "Modules/Simulations/SimulationHeatmap";
    simulation: number;
    type: "pathways" | "nodes";
    mode: "top" | "selected";
    sortBy: "perturbation" | "activity";
    n: number;
    absolute: boolean;
    limit: "none" | "positive" | "negative";
    attach?: {
        tags: string[];
        mode: "all" | "any";
        simulations: string[];
    };
    title: string;
    height: number;
}

const SimulationHeatmapEditor: React.FC<Props> = ({
    simulation,
    canEditPages,
    selectedPathways,
    selectedNodes,
}: Props) => {
    const selectedNodesVector = Object.values(selectedNodes).flatMap((a) => a);
    const [pluginCode, setPluginCode] = useState("");
    const [state, setState] = useState<State>({
        plugin: "Modules/Simulations/SimulationHeatmap",
        simulation: simulation,
        type: "pathways",
        mode: "top",
        sortBy: "perturbation",
        n: 10,
        absolute: false,
        limit: "none",
        attach: {
            tags: [],
            mode: "all",
            simulations: [],
        },
        title: "",
        height: 600,
    });
    const selection =
        state.type === "pathways" ? selectedPathways : selectedNodesVector;
    const selectionDisabled = selection.length === 0;
    const selectionText = selectionDisabled
        ? ` (Select at least one ${
              state.type === "pathways" ? "pathway" : "node"
          } to enable)`
        : "";

    useEffect(() => {
        setPluginCode(`\`\`\`SciKi
${JSON.stringify(
    {
        ...state,
        selection: state.mode === "selected" ? selection : undefined,
    },
    undefined,
    2
)}
\`\`\``);
    }, [setPluginCode, simulation, state, selection]);

    return (
        <>
            <Row>
                <Col xs="12" xl={canEditPages ? 8 : 12}>
                    <SimulationHeatmap
                        {...state}
                        selection={
                            state.mode === "selected" ? selection : undefined
                        }
                    />
                </Col>
                <Col xs="12" xl="4" className="d-flex flex-column">
                    <Card className="bg-gradient-dark shadow mb-2 flex-grow-1">
                        <CardHeader className="bg-transparent">
                            <h6 className="text-uppercase text-light ls-1 mb-1">
                                Change your heatmap
                            </h6>
                        </CardHeader>
                        <CardBody className="text-white-50">
                            <FormGroup>
                                <Label for="input-title">Title</Label>
                                <Input
                                    id="input-title"
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
                                <Label for="input-height">Height</Label>
                                <Input
                                    id="input-height"
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
                            <FormGroup>
                                <Label for="input-type">Type</Label>
                                <Input
                                    id="input-type"
                                    type="select"
                                    value={state.type}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            type:
                                                e.target.value === "pathways"
                                                    ? "pathways"
                                                    : "nodes",
                                        }))
                                    }
                                >
                                    <option value="pathways">Pathways</option>
                                    <option value="nodes">Nodes</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="input-sortBy">Sort by</Label>
                                <Input
                                    id="input-sortBy"
                                    type="select"
                                    value={state.sortBy}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            sortBy:
                                                e.target.value ===
                                                "perturbation"
                                                    ? "perturbation"
                                                    : "activity",
                                        }))
                                    }
                                >
                                    <option value="perturbation">
                                        Perturbation
                                    </option>
                                    <option value="activity">Activity</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="input-mode">Mode</Label>
                                <Input
                                    id="input-mode"
                                    type="select"
                                    value={state.mode}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            mode:
                                                e.target.value === "top"
                                                    ? "top"
                                                    : "selected",
                                        }))
                                    }
                                >
                                    <option value="top">Top-N</option>
                                    <option
                                        value="selected"
                                        disabled={selectionDisabled}
                                    >
                                        {`Selected${selectionText}`}
                                    </option>
                                </Input>
                            </FormGroup>
                            {/*<div className="custom-control custom-checkbox mb-3">*/}
                            {/*    <input*/}
                            {/*        className="custom-control-input"*/}
                            {/*        id="check-pathways"*/}
                            {/*        checked={usePathwaysSelection}*/}
                            {/*        disabled={pathwaysSelection.length === 0}*/}
                            {/*        type="checkbox"*/}
                            {/*        onChange={(e) =>*/}
                            {/*            setUsePathwaysSelection(*/}
                            {/*                e.target.checked*/}
                            {/*            )*/}
                            {/*        }*/}
                            {/*    />*/}
                            {/*    <label*/}
                            {/*        className="custom-control-label"*/}
                            {/*        htmlFor="check-pathways"*/}
                            {/*    >*/}
                            {/*        Show only selected pathways? (The editor*/}
                            {/*        will not reflect this change)*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                            {/*<div className="custom-control custom-checkbox mb-3">*/}
                            {/*    <input*/}
                            {/*        className="custom-control-input"*/}
                            {/*        id="check-filterable"*/}
                            {/*        checked={state.filterable}*/}
                            {/*        type="checkbox"*/}
                            {/*        onChange={(e) =>*/}
                            {/*            setState((prevState) => ({*/}
                            {/*                ...prevState,*/}
                            {/*                filterable: e.target.checked,*/}
                            {/*            }))*/}
                            {/*        }*/}
                            {/*    />*/}
                            {/*    <label*/}
                            {/*        className="custom-control-label"*/}
                            {/*        htmlFor="check-filterable"*/}
                            {/*    >*/}
                            {/*        Enable search?*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                            {/*<div className="custom-control custom-checkbox mb-3">*/}
                            {/*    <input*/}
                            {/*        className="custom-control-input"*/}
                            {/*        id="check-sortable"*/}
                            {/*        checked={state.sortable}*/}
                            {/*        type="checkbox"*/}
                            {/*        onChange={(e) =>*/}
                            {/*            setState((prevState) => ({*/}
                            {/*                ...prevState,*/}
                            {/*                sortable: e.target.checked,*/}
                            {/*            }))*/}
                            {/*        }*/}
                            {/*    />*/}
                            {/*    <label*/}
                            {/*        className="custom-control-label"*/}
                            {/*        htmlFor="check-sortable"*/}
                            {/*    >*/}
                            {/*        Enable sorting?*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                            {/*{state.sortable && (*/}
                            {/*    <>*/}
                            {/*        <FormGroup>*/}
                            {/*            <Label for="input-sortBy">*/}
                            {/*                Sorting*/}
                            {/*            </Label>*/}
                            {/*            <Row>*/}
                            {/*                <Col xs={6}>*/}
                            {/*                    <Input*/}
                            {/*                        id="input-sortBy"*/}
                            {/*                        type="select"*/}
                            {/*                        value={*/}
                            {/*                            state.defaultSorting*/}
                            {/*                                .dataField*/}
                            {/*                        }*/}
                            {/*                        onChange={(e) =>*/}
                            {/*                            setState(*/}
                            {/*                                (prevState) => ({*/}
                            {/*                                    ...prevState,*/}
                            {/*                                    defaultSorting:*/}
                            {/*                                        {*/}
                            {/*                                            ...prevState.defaultSorting,*/}
                            {/*                                            dataField:*/}
                            {/*                                                e*/}
                            {/*                                                    .target*/}
                            {/*                                                    .value as keyof Pathway,*/}
                            {/*                                        },*/}
                            {/*                                })*/}
                            {/*                            )*/}
                            {/*                        }*/}
                            {/*                    >*/}
                            {/*                        <option value="pathwayId">*/}
                            {/*                            Id*/}
                            {/*                        </option>*/}
                            {/*                        <option value="pathwayName">*/}
                            {/*                            Name*/}
                            {/*                        </option>*/}
                            {/*                        <option value="pathwayActivityScore">*/}
                            {/*                            Activity Score*/}
                            {/*                        </option>*/}
                            {/*                        <option value="averagePathwayPerturbation">*/}
                            {/*                            Perturbation*/}
                            {/*                        </option>*/}
                            {/*                        <option value="pathwayPValue">*/}
                            {/*                            p-value*/}
                            {/*                        </option>*/}
                            {/*                        <option value="pathwayFDR">*/}
                            {/*                            FDR*/}
                            {/*                        </option>*/}
                            {/*                    </Input>*/}
                            {/*                </Col>*/}
                            {/*                <Col xs={6}>*/}
                            {/*                    <Input*/}
                            {/*                        id="input-sortDirection"*/}
                            {/*                        type="select"*/}
                            {/*                        value={*/}
                            {/*                            state.defaultSorting*/}
                            {/*                                .order*/}
                            {/*                        }*/}
                            {/*                        onChange={(e) =>*/}
                            {/*                            setState(*/}
                            {/*                                (prevState) => ({*/}
                            {/*                                    ...prevState,*/}
                            {/*                                    defaultSorting:*/}
                            {/*                                        {*/}
                            {/*                                            ...prevState.defaultSorting,*/}
                            {/*                                            order: e*/}
                            {/*                                                .target*/}
                            {/*                                                .value as SortOrder,*/}
                            {/*                                        },*/}
                            {/*                                })*/}
                            {/*                            )*/}
                            {/*                        }*/}
                            {/*                    >*/}
                            {/*                        <option value="asc">*/}
                            {/*                            ASC*/}
                            {/*                        </option>*/}
                            {/*                        <option value="desc">*/}
                            {/*                            DESC*/}
                            {/*                        </option>*/}
                            {/*                    </Input>*/}
                            {/*                </Col>*/}
                            {/*            </Row>*/}
                            {/*        </FormGroup>*/}
                            {/*    </>*/}
                            {/*)}*/}
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

export default SimulationHeatmapEditor;

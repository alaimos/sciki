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
import PathwaysTable, { Pathway } from "../WikiPlugins/PathwaysTable";
import { SortOrder } from "react-bootstrap-table-next";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "react-select2-wrapper/css/select2.css";

interface Props {
    simulation: number;
    canEditPages: boolean;
    onSelect?: (pathway: string) => void;
    onView?: (pathway: string) => void;
}

interface State {
    plugin: "@Simulations:PathwaysTable";
    simulation: number;
    pathways: string[];
    sortable: boolean;
    filterable: boolean;
    defaultSorting: { dataField: keyof Pathway; order: SortOrder };
}

const PathwaysTableEditor: React.FC<Props> = ({
    simulation,
    canEditPages,
    onSelect,
    onView,
}: Props) => {
    const [pluginCode, setPluginCode] = useState("");
    const [usePathwaysSelection, setUsePathwaysSelection] = useState(false);
    const [pathwaysSelection, setPathwaysSelection] = useState<string[]>([]);
    const [state, setState] = useState<State>({
        plugin: "@Simulations:PathwaysTable",
        simulation: simulation,
        pathways: [],
        sortable: true,
        filterable: true,
        defaultSorting: {
            dataField: "pathwayFDR",
            order: "asc",
        },
    });

    const internalOnSelect = canEditPages
        ? (pathway: string) => {
              setPathwaysSelection((prevState) => {
                  if (prevState.includes(pathway)) {
                      return prevState.filter((v) => v !== pathway);
                  } else {
                      return [...prevState, pathway];
                  }
              });
              if (onSelect && pathway) onSelect(pathway);
          }
        : undefined;

    useEffect(() => {
        const realState =
            usePathwaysSelection && pathwaysSelection.length > 0
                ? {
                      ...state,
                      pathways: pathwaysSelection,
                  }
                : state;
        setPluginCode(`\`\`\`SciKi
${JSON.stringify(realState, undefined, 2)}
\`\`\``);
    }, [
        setPluginCode,
        simulation,
        state,
        usePathwaysSelection,
        pathwaysSelection,
    ]);

    return (
        <>
            <Row>
                <Col xs="12" xl={canEditPages ? 8 : 12}>
                    <PathwaysTable
                        {...state}
                        onSelect={internalOnSelect}
                        onView={onView}
                        enableId
                    />
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
                                <div className="custom-control custom-checkbox mb-3">
                                    <input
                                        className="custom-control-input"
                                        id="check-pathways"
                                        checked={usePathwaysSelection}
                                        disabled={
                                            pathwaysSelection.length === 0
                                        }
                                        type="checkbox"
                                        onChange={(e) =>
                                            setUsePathwaysSelection(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <label
                                        className="custom-control-label"
                                        htmlFor="check-pathways"
                                    >
                                        Show only selected pathways? (The editor
                                        will not reflect this change)
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox mb-3">
                                    <input
                                        className="custom-control-input"
                                        id="check-filterable"
                                        checked={state.filterable}
                                        type="checkbox"
                                        onChange={(e) =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                filterable: e.target.checked,
                                            }))
                                        }
                                    />
                                    <label
                                        className="custom-control-label"
                                        htmlFor="check-filterable"
                                    >
                                        Enable search?
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox mb-3">
                                    <input
                                        className="custom-control-input"
                                        id="check-sortable"
                                        checked={state.sortable}
                                        type="checkbox"
                                        onChange={(e) =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                sortable: e.target.checked,
                                            }))
                                        }
                                    />
                                    <label
                                        className="custom-control-label"
                                        htmlFor="check-sortable"
                                    >
                                        Enable sorting?
                                    </label>
                                </div>
                                {state.sortable && (
                                    <>
                                        <FormGroup>
                                            <Label for="input-sortBy">
                                                Sorting
                                            </Label>
                                            <Row>
                                                <Col xs={6}>
                                                    <Input
                                                        id="input-sortBy"
                                                        type="select"
                                                        value={
                                                            state.defaultSorting
                                                                .dataField
                                                        }
                                                        onChange={(e) =>
                                                            setState(
                                                                (
                                                                    prevState
                                                                ) => ({
                                                                    ...prevState,
                                                                    defaultSorting:
                                                                        {
                                                                            ...prevState.defaultSorting,
                                                                            dataField:
                                                                                e
                                                                                    .target
                                                                                    .value as keyof Pathway,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <option value="pathwayId">
                                                            Id
                                                        </option>
                                                        <option value="pathwayName">
                                                            Name
                                                        </option>
                                                        <option value="pathwayActivityScore">
                                                            Activity Score
                                                        </option>
                                                        <option value="averagePathwayPerturbation">
                                                            Perturbation
                                                        </option>
                                                        <option value="pathwayPValue">
                                                            p-value
                                                        </option>
                                                        <option value="pathwayFDR">
                                                            FDR
                                                        </option>
                                                    </Input>
                                                </Col>
                                                <Col xs={6}>
                                                    <Input
                                                        id="input-sortDirection"
                                                        type="select"
                                                        value={
                                                            state.defaultSorting
                                                                .order
                                                        }
                                                        onChange={(e) =>
                                                            setState(
                                                                (
                                                                    prevState
                                                                ) => ({
                                                                    ...prevState,
                                                                    defaultSorting:
                                                                        {
                                                                            ...prevState.defaultSorting,
                                                                            order: e
                                                                                .target
                                                                                .value as SortOrder,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <option value="asc">
                                                            ASC
                                                        </option>
                                                        <option value="desc">
                                                            DESC
                                                        </option>
                                                    </Input>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </>
                                )}
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

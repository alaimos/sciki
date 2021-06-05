/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Row,
    UncontrolledTooltip,
} from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import CorrelationGraph from "../WikiPlugins/CorrelationGraph";
import axios from "axios";
import route from "ziggy-js";

import "react-bootstrap-typeahead/css/Typeahead.css";

interface Props {
    simulation: number;
    canEditPages: boolean;
    onIdChange: (id: string) => void;
}

type Correlation = "pearson" | "spearman";
type Direction = "positive" | "negative";
type SearchMode = "all" | "any";

interface State {
    plugin: "@Simulations:CorrelationGraph";
    id: string;
    simulation: number;
    fn: Correlation;
    top: boolean;
    n: number;
    direction: Direction;
    useEndpoints: boolean;
    usePerturbation: boolean;
    findByTags: string[];
    searchMode: SearchMode;
    title: string;
    height: number;
}

const CorrelationGraphEditor: React.FC<Props> = ({
    simulation,
    canEditPages,
    onIdChange,
}: Props) => {
    const typeAheadRefTag = useRef<AsyncTypeahead<string>>(null);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [tagInputValue, setTagInputValue] = useState<string[]>([]);
    const [tagInputOptions, setTagInputOptions] = useState<string[]>([]);
    const [pluginCode, setPluginCode] = useState("");
    const [state, setState] = useState<State>({
        plugin: "@Simulations:CorrelationGraph",
        id: `corr-graph-${Math.random().toString(36).substr(2, 10)}`,
        simulation: simulation,
        fn: "pearson",
        top: false,
        n: 10,
        direction: "negative",
        useEndpoints: true,
        usePerturbation: false,
        findByTags: [],
        searchMode: "all",
        title: "",
        height: 600,
    });

    useEffect(() => {
        onIdChange(state.id);
    }, [state.id]);

    const doAddTag = () => {
        if (tagInputValue && tagInputValue.length > 0) {
            const newTag = tagInputValue[0];
            if (newTag) {
                setState((prevState) => ({
                    ...prevState,
                    findByTags: [
                        ...prevState.findByTags.filter((t) => t !== newTag),
                        newTag,
                    ],
                }));
                // @ts-ignore
                typeAheadRefTag.current?.clear();
            }
        }
    };
    const handleSearchTag = async (query: string) => {
        setIsLoadingTags(true);
        try {
            const response = await axios.post(route("tag.typeahead"), {
                query,
            });
            setTagInputOptions(response.data as string[]);
        } catch (_) {
            setTagInputOptions([]);
        }
        setIsLoadingTags(false);
    };
    const handleDeleteTag =
        (tag: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setState((prevState) => ({
                ...prevState,
                findByTags: [...prevState.findByTags.filter((t) => t !== tag)],
            }));
        };

    useEffect(() => {
        setPluginCode(`\`\`\`SciKi
${JSON.stringify(state, undefined, 2)}
\`\`\``);
    }, [setPluginCode, simulation, state]);

    return (
        <>
            <Row>
                <Col xs="12" xl="8">
                    <CorrelationGraph {...state} />
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
                                <Label for="input-correlation">
                                    Correlation
                                </Label>
                                <Input
                                    id="input-correlation"
                                    type="select"
                                    value={state.fn}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            fn: e.target
                                                .value as unknown as Correlation,
                                        }))
                                    }
                                >
                                    <option value="pearson">Pearson</option>
                                    <option value="spearman">Spearman</option>
                                </Input>
                            </FormGroup>
                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    className="custom-control-input"
                                    id="check-use-endpoints"
                                    checked={state.useEndpoints}
                                    type="checkbox"
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            useEndpoints: e.target.checked,
                                        }))
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="check-use-endpoints"
                                >
                                    Compute correlation on Endpoints?
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    className="custom-control-input"
                                    id="check-use-perturbation"
                                    checked={state.usePerturbation}
                                    type="checkbox"
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            usePerturbation: e.target.checked,
                                        }))
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="check-use-perturbation"
                                >
                                    Compute correlation using Perturbation?
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    className="custom-control-input"
                                    id="check-top-n"
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
                                    htmlFor="check-top-n"
                                >
                                    Show only the top-N results?
                                </label>
                            </div>
                            {state.top && (
                                <>
                                    <FormGroup>
                                        <Label for="input-number">
                                            Number of top results
                                        </Label>
                                        <Input
                                            id="input-number"
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
                                        <Label for="input-direction">
                                            Direction
                                        </Label>
                                        <Input
                                            id="input-direction"
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
                </Col>
            </Row>
            <Row>
                <Col xs="12" xl={canEditPages ? "8" : "12"}>
                    <Card className="bg-gradient-dark shadow flex-grow-1">
                        <CardHeader className="bg-transparent">
                            <h6 className="text-uppercase text-light ls-1 mb-1">
                                Add columns
                            </h6>
                        </CardHeader>
                        <CardBody>
                            <div className="d-flex flex-row justify-content-start align-items-center text-sm text-white-50 flex-wrap">
                                <div>Compare with simulations having</div>
                                <Input
                                    type="select"
                                    value={state.searchMode ?? "all"}
                                    className="form-control-sm mx-2"
                                    style={{ width: "auto" }}
                                    onChange={(e) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            searchMode: e.target
                                                .value as unknown as SearchMode,
                                        }))
                                    }
                                >
                                    <option value="all">all</option>
                                    <option value="any">any</option>
                                </Input>
                                <div>tags:</div>
                            </div>
                            <Row>
                                <Col
                                    style={{ height: "100px" }}
                                    className="overflow-auto"
                                >
                                    {state.findByTags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            className="badge-default mx-1 text-light"
                                            href="#"
                                            onClick={handleDeleteTag(tag)}
                                            title="Click to delete"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <InputGroup>
                                        <AsyncTypeahead<string>
                                            filterBy={() => true}
                                            id="tags-add-tag-input"
                                            isLoading={isLoadingTags}
                                            options={tagInputOptions}
                                            onSearch={handleSearchTag}
                                            onChange={(selected: string[]) =>
                                                setTagInputValue(selected)
                                            }
                                            onKeyDown={(e) => {
                                                const re =
                                                    e as unknown as React.KeyboardEvent<HTMLInputElement>;
                                                if (
                                                    re.code === "Enter" ||
                                                    re.code === "NumpadEnter"
                                                ) {
                                                    doAddTag();
                                                }
                                            }}
                                            selected={tagInputValue}
                                            minLength={3}
                                            className="text-dark"
                                            placeholder="Add new tag (category: tag)"
                                            ref={typeAheadRefTag}
                                        />
                                        <InputGroupAddon addonType="append">
                                            <InputGroupText>
                                                <a
                                                    className="text-primary"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        doAddTag();
                                                    }}
                                                >
                                                    <i className="fas fa-plus" />
                                                </a>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
                {canEditPages && (
                    <Col xs="12" xl="4">
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
                    </Col>
                )}
            </Row>
        </>
    );
};

export default CorrelationGraphEditor;

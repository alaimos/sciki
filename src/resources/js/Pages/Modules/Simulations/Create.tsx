import React from "react";
import { get, has, set, unset } from "lodash";
import Header from "../../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
} from "reactstrap";
import type { CommonPageProps } from "../../../Types/page";
import { useForm } from "@inertiajs/inertia-react";
import TagsManagerCard from "../../../Components/TagsManagerCard";
import route from "ziggy-js";
import classNames from "classnames";
import NodesTable, {
    NodeType,
} from "../../../Components/Modules/Simulations/NodesTable";

interface Organism {
    id: number;
    name: string;
}

interface Props extends CommonPageProps {
    organisms: Organism[];
}

interface FormType {
    name: string;
    remote_id?: number;
    nodes?: Record<number, NodeType>;
    organism?: number;
    tags: string[];
    existing: boolean;
}

const Create: React.FC<Props> = ({
    capabilities: {
        simulations: { create: canCreateSimulation },
    },
    organisms,
}: Props) => {
    if (!canCreateSimulation) return null;
    const { data, setData, errors, post, processing } = useForm<FormType>({
        name: "",
        nodes: {},
        tags: [],
        existing: false,
    });
    const submitForm = async (
        e:
            | React.MouseEvent<HTMLAnchorElement>
            | React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        if (
            !data.existing &&
            !Object.values(data.nodes ?? {}).some((v) =>
                [NodeType.OVER_EXPRESSED, NodeType.UNDER_EXPRESSED].includes(v)
            )
        ) {
            alert(
                "You must select at least one over- or under-expressed node for the simulation."
            );
            return;
        }
        if (
            data.tags.length === 0 &&
            !confirm(
                "You did not select any tag for your simulation. " +
                    "Tagging the simulation is fundamental to use many advanced features. Are you sure?"
            )
        )
            return;
        await post(route("simulations.store"));
    };

    return (
        <Form onSubmit={submitForm}>
            <Header title="New simulation" />
            <Container className="mt--7" fluid>
                <Row className="mb-2">
                    <Col lg={12} className="text-right">
                        <Nav
                            className="nav-fill flex-column-reverse flex-sm-row-reverse"
                            pills
                        >
                            <NavItem className="flex-grow-0">
                                <NavLink
                                    className="mb-sm-3 mb-md-0"
                                    onClick={submitForm}
                                    disabled={processing}
                                    href="#"
                                >
                                    <i className="fas fa-save mr-2" />
                                    Save
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                <Row>
                    <Col className="mb-5 mb-xl-2" xl="8">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase text-dark ls-1 mb-1">
                                    Simulation Details
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <FormGroup
                                    className={classNames({
                                        "has-danger": !!errors.name,
                                    })}
                                >
                                    <Label for="create-simulation-name-field">
                                        Name:
                                    </Label>
                                    <Input
                                        id="create-simulation-name-field"
                                        placeholder="Give a name to your simulation"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        invalid={!!errors.name}
                                    />
                                    <FormFeedback
                                        tag="span"
                                        className="invalid-feedback"
                                    >
                                        <strong>{errors.name}</strong>
                                    </FormFeedback>
                                </FormGroup>
                                <Row>
                                    <Col xs={1}>
                                        <label className="custom-toggle">
                                            <input
                                                type="checkbox"
                                                checked={data.existing}
                                                onChange={() =>
                                                    setData((previousData) => ({
                                                        ...previousData,
                                                        existing:
                                                            !previousData.existing,
                                                    }))
                                                }
                                            />
                                            <span className="custom-toggle-slider rounded-circle" />
                                        </label>
                                    </Col>
                                    <Col xs="11">
                                        Import an existing simulation?
                                    </Col>
                                </Row>
                                {data.existing && (
                                    <FormGroup
                                        className={classNames({
                                            "has-danger": !!errors.remote_id,
                                        })}
                                    >
                                        <Label for="create-simulation-name-field">
                                            Simulation Id:
                                        </Label>
                                        <Input
                                            id="create-simulation-id-field"
                                            placeholder="Insert here the ID of an existing simulation"
                                            type="text"
                                            value={data.remote_id}
                                            onChange={(e) =>
                                                setData(
                                                    "remote_id",
                                                    +e.target.value
                                                )
                                            }
                                            invalid={!!errors.remote_id}
                                        />
                                        <FormFeedback
                                            tag="span"
                                            className="invalid-feedback"
                                        >
                                            <strong>{errors.remote_id}</strong>
                                        </FormFeedback>
                                    </FormGroup>
                                )}
                                {!data.existing && (
                                    <>
                                        <FormGroup
                                            className={classNames({
                                                "has-danger": !!errors.organism,
                                            })}
                                        >
                                            <Label for="create-simulation-organism-field">
                                                Organism:
                                            </Label>
                                            <Input
                                                id="create-simulation-organism-field"
                                                placeholder="Give a name to your simulation"
                                                type="select"
                                                value={data.organism}
                                                onChange={(e) =>
                                                    setData(
                                                        "organism",
                                                        +e.target.value
                                                    )
                                                }
                                                invalid={!!errors.organism}
                                            >
                                                <option value="">
                                                    -- Select an organism --
                                                </option>
                                                {organisms.map((o) => (
                                                    <option
                                                        value={o.id}
                                                        key={o.id}
                                                    >
                                                        {o.name}
                                                    </option>
                                                ))}
                                            </Input>
                                            <FormFeedback
                                                tag="span"
                                                className="invalid-feedback"
                                            >
                                                <strong>
                                                    {errors.organism}
                                                </strong>
                                            </FormFeedback>
                                        </FormGroup>
                                        <FormGroup
                                            className={classNames({
                                                "has-danger": !!errors.nodes,
                                            })}
                                        >
                                            <Label for="create-simulation-nodes-table">
                                                Nodes:
                                            </Label>
                                            <NodesTable
                                                organism={data.organism}
                                                selectedNodes={data.nodes ?? {}}
                                                onNodeClick={(node, type) => {
                                                    setData((previousData) => {
                                                        let nodes = {
                                                            ...previousData.nodes,
                                                        };
                                                        if (
                                                            has(nodes, node) &&
                                                            get(nodes, node) ===
                                                                type
                                                        ) {
                                                            unset(nodes, node);
                                                        } else {
                                                            nodes = set(
                                                                nodes,
                                                                node,
                                                                type
                                                            );
                                                        }
                                                        return {
                                                            ...previousData,
                                                            nodes,
                                                        };
                                                    });
                                                }}
                                            />
                                            <FormFeedback
                                                tag="span"
                                                className={classNames({
                                                    "invalid-feedback": true,
                                                    "d-block": !!errors.nodes,
                                                })}
                                            >
                                                <strong>{errors.nodes}</strong>
                                            </FormFeedback>
                                        </FormGroup>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="mb-5 mb-xl-2" xl="4">
                        <TagsManagerCard
                            tags={data.tags}
                            onAddTag={(newTag) =>
                                setData((previousData) => ({
                                    ...previousData,
                                    tags: [
                                        ...previousData.tags.filter(
                                            (t) => t !== newTag
                                        ),
                                        newTag,
                                    ],
                                }))
                            }
                            onDeleteTag={(deletedTag) =>
                                setData((previousData) => ({
                                    ...previousData,
                                    tags: previousData.tags.filter(
                                        (t) => t !== deletedTag
                                    ),
                                }))
                            }
                        />
                    </Col>
                </Row>
            </Container>
        </Form>
    );
};

export default Create;

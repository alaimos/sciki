import React from "react";
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
import BootstrapTable, {
    SizePerPageRendererOptions,
} from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";

import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";

const { SearchBar } = Search;

const pagination = paginationFactory({
    page: 1,
    alwaysShowAllBtns: true,
    showTotal: true,
    withFirstAndLast: false,
    sizePerPageRenderer: ({
        onSizePerPageChange,
    }: SizePerPageRendererOptions) => (
        <div className="dataTables_length" id="datatable-basic_length">
            <label>
                Show{" "}
                {
                    <select
                        name="datatable-basic_length"
                        aria-controls="datatable-basic"
                        className="form-control form-control-sm"
                        onChange={(e) =>
                            onSizePerPageChange(1, +e.target.value)
                        }
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                }{" "}
                entries.
            </label>
        </div>
    ),
});

interface Organism {
    id: number;
    name: string;
}

interface Props extends CommonPageProps {
    organisms: Organism[];
    nodes: {
        data: {
            id: number;
            accession: string;
            name: string;
            aliases: string[];
        }[];
    };
}

enum Type {
    NON_EXPRESSED = 0,
    OVER_EXPRESSED = 1,
    UNDER_EXPRESSED = 2,
}

interface FormType {
    name: string;
    remote_id?: number;
    nodes?: Record<number, Type>;
    organism?: number;
    tags: string[];
}

const Create: React.FC<Props> = ({
    capabilities: {
        simulations: { create: canCreateSimulation },
    },
    organisms,
    nodes,
}: Props) => {
    if (!canCreateSimulation) return null;
    const { data, setData, errors, post, processing } = useForm<FormType>({
        name: "",
        nodes: {},
        tags: [],
    });

    console.log(organisms, nodes);
    const submitForm = async (
        e:
            | React.MouseEvent<HTMLAnchorElement>
            | React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
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
                                            setData("organism", +e.target.value)
                                        }
                                        invalid={!!errors.organism}
                                    >
                                        <option value="">
                                            -- Select an organism --
                                        </option>
                                        {organisms.map((o) => (
                                            <option value={o.id} key={o.id}>
                                                {o.name}
                                            </option>
                                        ))}
                                    </Input>
                                    <FormFeedback
                                        tag="span"
                                        className="invalid-feedback"
                                    >
                                        <strong>{errors.organism}</strong>
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
                                    <div>
                                        <ToolkitProvider
                                            keyField="id"
                                            data={nodes.data}
                                            columns={[
                                                {
                                                    dataField: "accession",
                                                    text: "Accession",
                                                    sort: true,
                                                    filter: textFilter(),
                                                },
                                                {
                                                    dataField: "name",
                                                    text: "Name",
                                                    sort: true,
                                                    filter: textFilter(),
                                                },
                                            ]}
                                            search
                                        >
                                            {(props) => (
                                                <div className="py-4">
                                                    <Container fluid>
                                                        <Row>
                                                            <Col
                                                                xs={12}
                                                                sm={{
                                                                    size: 6,
                                                                    offset: 6,
                                                                }}
                                                            >
                                                                <div
                                                                    id="datatable-basic_filter"
                                                                    className="dataTables_filter px-4 pb-1 float-right"
                                                                >
                                                                    <label>
                                                                        Search:
                                                                        <SearchBar
                                                                            className="form-control-sm"
                                                                            placeholder=""
                                                                            {...props.searchProps}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Container>
                                                    <BootstrapTable
                                                        {...props.baseProps}
                                                        remote
                                                        bootstrap4
                                                        pagination={pagination}
                                                        filter={filterFactory()}
                                                        bordered={false}
                                                        onTableChange={(
                                                            type,
                                                            newState
                                                        ) => {
                                                            console.log(
                                                                type,
                                                                newState
                                                            );
                                                            // 'filter' | 'pagination' | 'sort'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </ToolkitProvider>
                                    </div>
                                    <FormFeedback
                                        tag="span"
                                        className="invalid-feedback"
                                    >
                                        <strong>{errors.nodes}</strong>
                                    </FormFeedback>
                                </FormGroup>
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

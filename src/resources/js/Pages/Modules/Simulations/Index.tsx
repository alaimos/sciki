/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../../Components/Layout/Headers/DefaultHeader";
import {
    Badge,
    Card,
    CardBody,
    Col,
    Container,
    Nav,
    NavItem,
    NavLink,
    Row,
    UncontrolledTooltip,
} from "reactstrap";
import type { CommonPageProps } from "../../../Types/page";
import BootstrapTable, {
    ColumnDescription,
    ExpandRowProps,
    SizePerPageRendererOptions,
} from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
    textFilter,
    selectFilter,
} from "react-bootstrap-table2-filter";
import axios from "axios";
// @ts-ignore
import overlayFactory from "react-bootstrap-table2-overlay";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";

interface Organism {
    id: number;
    name: string;
}

interface State {
    data?: Node[];
    sizePerPage: number;
    page: number;
    totalSize: number;
}

interface Props extends CommonPageProps {
    organisms: Organism[];
    states: { value: number; label: string }[];
}

const Index: React.FC<Props> = ({
    capabilities: {
        pages: { update: canUpdatePages },
        simulations: {
            create: canCreateSimulation,
            perform_actions: canPerformActions,
        },
    },
    states: simulationStates,
}: Props) => {
    const [state, setState] = useState<State>({
        data: undefined,
        sizePerPage: 10,
        page: 1,
        totalSize: 0,
    });

    const { data, sizePerPage, page, totalSize } = state;

    useEffect(() => {
        if (data === undefined) {
            axios
                .post<State>(route("simulations.table"), {
                    sortField: "created_at",
                    sortOrder: "desc",
                })
                .then((value) => {
                    setState((prevState) => ({
                        ...prevState,
                        ...value.data,
                    }));
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    }, []);

    const pagination = useMemo(
        () =>
            paginationFactory({
                page,
                totalSize,
                sizePerPage,
                alwaysShowAllBtns: true,
                showTotal: true,
                withFirstAndLast: false,
                sizePerPageRenderer: ({
                    onSizePerPageChange,
                }: SizePerPageRendererOptions) => (
                    <div
                        className="dataTables_length"
                        id="datatable-basic_length"
                    >
                        <label>
                            Show{" "}
                            {
                                <select
                                    name="datatable-basic_length"
                                    aria-controls="datatable-basic"
                                    className="form-control form-control-sm"
                                    onChange={(e) =>
                                        onSizePerPageChange(+e.target.value, 1)
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
            }),
        [page, totalSize, sizePerPage]
    );

    const columns: ColumnDescription[] = [
        {
            dataField: "name",
            text: "Name",
            sort: true,
            filter: textFilter({
                className: "form-control-sm",
            }),
        },
        {
            dataField: "status",
            text: "Status",
            sort: true,
            formatter: (_, row) => row.readable_status,
            filter: selectFilter({
                options: simulationStates,
                className: "form-control-sm",
            }),
        },
        {
            dataField: "created_at",
            text: "Created at",
            sort: true,
            formatter: (_, row) => row.readable_created_at,
        },
    ];
    if (canUpdatePages) {
        columns.unshift({
            dataField: "id",
            text: "Id",
            sort: true,
            headerStyle: {
                width: "60px",
            },
        });
    }
    if (canPerformActions) {
        columns.push({
            dataField: "actions",
            isDummyField: true,
            text: "",
            sort: false,
            headerStyle: {
                width: "120px",
            },
            formatter: (_, row) => {
                return (
                    <>
                        {row.can.update && !!row.public && (
                            <>
                                <InertiaLink
                                    id={`make-private-link-${row.id}`}
                                    href={route("simulations.publish", row.id)}
                                    className="btn btn-sm btn-link"
                                >
                                    <i className="fas fa-lock text-warning" />
                                </InertiaLink>
                                <UncontrolledTooltip
                                    placement="auto"
                                    target={`make-private-link-${row.id}`}
                                >
                                    Make private
                                </UncontrolledTooltip>
                            </>
                        )}
                        {row.can.update && !row.public && (
                            <>
                                <InertiaLink
                                    id={`publish-link-${row.id}`}
                                    href={route("simulations.publish", row.id)}
                                    className="btn btn-sm btn-link"
                                >
                                    <i className="fas fa-unlock text-green" />
                                </InertiaLink>
                                <UncontrolledTooltip
                                    placement="auto"
                                    target={`publish-link-${row.id}`}
                                >
                                    Publish
                                </UncontrolledTooltip>
                            </>
                        )}
                        {row.can.delete && (
                            <>
                                <InertiaLink
                                    id={`delete-link-${row.id}`}
                                    as="button"
                                    method="delete"
                                    href={route("simulations.destroy", row.id)}
                                    className="btn btn-sm btn-link"
                                    onClick={(e) => {
                                        if (
                                            !confirm(
                                                "Do you really want to delete this simulation?"
                                            )
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                    preserveState={false}
                                >
                                    <i className="fas fa-trash text-danger" />
                                </InertiaLink>
                                <UncontrolledTooltip
                                    placement="auto"
                                    target={`delete-link-${row.id}`}
                                >
                                    Delete
                                </UncontrolledTooltip>
                            </>
                        )}
                    </>
                );
            },
        });
    }
    columns.push({
        dataField: "view",
        isDummyField: true,
        text: "",
        sort: false,
        headerStyle: {
            width: "60px",
        },
        formatter: (_, row) => {
            if (!row.can.view) return <></>;
            return (
                <>
                    <InertiaLink
                        id={`show-link-${row.id}`}
                        href={route("simulations.show", row.id)}
                        className="btn btn-sm btn-link"
                    >
                        <i className="fas fa-eye text-primary" />
                    </InertiaLink>
                    <UncontrolledTooltip
                        placement="auto"
                        target={`show-link-${row.id}`}
                    >
                        Show simulation
                    </UncontrolledTooltip>
                </>
            );
        },
    });

    const expandRow: ExpandRowProps<any, number> = {
        renderer: (row) => (
            <Row>
                <Col sm="2">Submitted by:</Col>
                <Col sm="10">
                    <strong>{row.user.name}</strong>
                </Col>
                <Col sm="2">Tags:</Col>
                <Col sm="10">
                    {row.formatted_tags.map((tag: string) => (
                        <Badge
                            key={tag}
                            className="badge-default mx-1 text-darker"
                        >
                            {tag}
                        </Badge>
                    ))}
                </Col>
            </Row>
        ),
        showExpandColumn: true,
        expandColumnPosition: "left",
        expandByColumnOnly: true,
    };

    return (
        <>
            <Header title="Simulations" />
            <Container className="mt--7" fluid>
                {canCreateSimulation && (
                    <Row className="mb-2">
                        <Col lg={12} className="text-right">
                            <Nav
                                className="nav-fill flex-column-reverse flex-sm-row-reverse"
                                pills
                            >
                                <NavItem className="flex-grow-0">
                                    <NavLink
                                        className="mb-sm-3 mb-md-0"
                                        tag={InertiaLink}
                                        href={route("simulations.create")}
                                    >
                                        <i className="fas fa-plus-square mr-2" />
                                        New simulation
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Col>
                    </Row>
                )}
                <Card className="shadow">
                    <CardBody>
                        <div className="py-4">
                            <BootstrapTable
                                keyField="id"
                                data={data ?? []}
                                columns={columns}
                                remote
                                bootstrap4
                                pagination={pagination}
                                filter={filterFactory()}
                                bordered={false}
                                defaultSorted={[
                                    {
                                        dataField: "created_at",
                                        order: "desc",
                                    },
                                ]}
                                onTableChange={(_, newState) => {
                                    axios
                                        .post<State>(
                                            route("simulations.table"),
                                            {
                                                page: newState.page,
                                                sizePerPage:
                                                    newState.sizePerPage,
                                                sortField: newState.sortField,
                                                sortOrder: newState.sortOrder,
                                                filters: newState.filters,
                                            }
                                        )
                                        .then((value) => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                ...value.data,
                                            }));
                                        })
                                        .catch((e) => {
                                            console.error(e);
                                        });
                                }}
                                overlay={overlayFactory({ spinner: true })}
                                expandRow={expandRow}
                            />
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Index;

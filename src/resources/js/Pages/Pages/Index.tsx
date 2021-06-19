/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import {
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
import type { CommonPageProps } from "../../Types/page";
import BootstrapTable, {
    ColumnDescription,
    SizePerPageRendererOptions,
} from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import axios from "axios";
// @ts-ignore
import overlayFactory from "react-bootstrap-table2-overlay";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import { Inertia } from "@inertiajs/inertia";
import SweetAlert from "react-bootstrap-sweetalert";

interface Page {
    id: string;
    title: string;
    slug: string;
    user_id: string;
    created_at: string;
    readable_created_at: string;
}

interface State {
    data?: Page[];
    sizePerPage: number;
    page: number;
    totalSize: number;
}

const Index: React.FC<CommonPageProps> = ({
    auth: { is_admin: userIsAdmin },
}: CommonPageProps) => {
    const [isAlertVisible, setIsAlertVisible] = useState(false);
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
                .post<State>(route("page.index.table"), {
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

    const handleCreatePage = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsAlertVisible(true);
    };

    const columns: ColumnDescription[] = [
        {
            dataField: "title",
            text: "Title",
            sort: true,
            filter: textFilter({
                className: "form-control-sm",
            }),
        },
        {
            dataField: "user_id",
            text: "Created by",
            sort: true,
            formatter: (_, row) => row.user.name,
        },
        {
            dataField: "created_at",
            text: "Created at",
            sort: true,
            formatter: (_, row) => row.readable_created_at,
        },
        {
            dataField: "actions",
            isDummyField: true,
            text: "",
            sort: false,
            headerStyle: {
                width: "160px",
            },
            formatter: (_, row) => {
                return (
                    <>
                        <InertiaLink
                            id={`view-link-${row.id}`}
                            href={route("wiki.show", row.slug)}
                            className="btn btn-sm btn-link"
                        >
                            <i className="fas fa-eye" />
                        </InertiaLink>
                        <UncontrolledTooltip
                            placement="auto"
                            target={`view-link-${row.id}`}
                        >
                            View
                        </UncontrolledTooltip>
                        <InertiaLink
                            id={`edit-link-${row.id}`}
                            href={route("page.edit", row.slug)}
                            className="btn btn-sm btn-link"
                        >
                            <i className="fas fa-pencil-alt" />
                        </InertiaLink>
                        <UncontrolledTooltip
                            placement="auto"
                            target={`edit-link-${row.id}`}
                        >
                            Edit
                        </UncontrolledTooltip>
                        <InertiaLink
                            id={`delete-link-${row.id}`}
                            as="button"
                            method="delete"
                            href={route("page.destroy", row.slug)}
                            className="btn btn-sm btn-link"
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
                );
            },
        },
    ];

    return (
        <>
            <Header title={userIsAdmin ? "Pages" : "My Pages"} />
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
                                    href="#"
                                    onClick={handleCreatePage}
                                >
                                    <i className="fas fa-plus-square mr-2" />
                                    New page
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
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
                                            route("page.index.table"),
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
                            />
                        </div>
                    </CardBody>
                </Card>
            </Container>
            {isAlertVisible && (
                <SweetAlert
                    input
                    showCancel
                    cancelBtnBsStyle="light"
                    title="Page title:"
                    required={false}
                    onConfirm={(title: string) => {
                        if (title.trim() !== "") {
                            return Inertia.post(route("page.store"), {
                                title: title.trim(),
                            });
                        }
                        return setIsAlertVisible(false);
                    }}
                    onCancel={() => setIsAlertVisible(false)}
                />
            )}
        </>
    );
};

export default Index;

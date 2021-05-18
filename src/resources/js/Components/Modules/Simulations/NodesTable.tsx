import React, { useEffect, useMemo, useState } from "react";
import { has, get } from "lodash";
import BootstrapTable, {
    SizePerPageRendererOptions,
} from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import axios from "axios";
// @ts-ignore
import overlayFactory from "react-bootstrap-table2-overlay";
import route from "ziggy-js";
import { Button, UncontrolledTooltip } from "reactstrap";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";

export enum NodeType {
    KNOCKOUT = -1,
    NON_EXPRESSED = 0,
    UNDER_EXPRESSED = 1,
    OVER_EXPRESSED = 2,
}

interface Props {
    organism?: number;
    selectedNodes: Record<number, NodeType>;
    onNodeClick: (node: number, type: NodeType) => void;
}

interface Node {
    id: number;
    accession: string;
    name: string;
}

interface State {
    data?: Node[];
    sizePerPage: number;
    page: number;
    totalSize: number;
}

const NodesTable: React.FC<Props> = ({
    organism,
    selectedNodes,
    onNodeClick,
}: Props) => {
    if (!organism)
        return (
            <div className="py-4">Please select an organism to continue</div>
        );

    const [state, setState] = useState<State>({
        data: undefined,
        sizePerPage: 10,
        page: 1,
        totalSize: 0,
    });

    const { data, sizePerPage, page, totalSize } = state;

    useEffect(() => {
        setState({
            data: undefined,
            sizePerPage: 10,
            page: 1,
            totalSize: 0,
        });
    }, [organism]);

    useEffect(() => {
        if (data === undefined) {
            axios
                .post<State>(route("simulations.nodes.table", organism), {})
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
    }, [organism, data]);

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

    return (
        <div className="py-4">
            <BootstrapTable
                keyField="id"
                data={data ?? []}
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
                    {
                        dataField: "overexpressed",
                        isDummyField: true,
                        text: "",
                        headerStyle: {
                            width: "60px",
                        },
                        formatter: (_, row) => {
                            const selected =
                                has(selectedNodes, row.id) &&
                                get(selectedNodes, row.id) ===
                                    NodeType.OVER_EXPRESSED;
                            return (
                                <>
                                    <Button
                                        id={`overexpressed-button-${row.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onNodeClick(
                                                row.id,
                                                NodeType.OVER_EXPRESSED
                                            );
                                        }}
                                        size="sm"
                                        color="danger"
                                        outline={!selected}
                                    >
                                        <i className="fas fa-level-up-alt fa-fw" />
                                    </Button>
                                    <UncontrolledTooltip
                                        placement="auto"
                                        target={`overexpressed-button-${row.id}`}
                                    >
                                        Set as overexpressed
                                    </UncontrolledTooltip>
                                </>
                            );
                        },
                    },
                    {
                        dataField: "underexpressed",
                        isDummyField: true,
                        text: "",
                        headerStyle: {
                            width: "60px",
                        },
                        formatter: (_, row) => {
                            const selected =
                                has(selectedNodes, row.id) &&
                                get(selectedNodes, row.id) ===
                                    NodeType.UNDER_EXPRESSED;
                            return (
                                <>
                                    <Button
                                        id={`underexpressed-button-${row.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onNodeClick(
                                                row.id,
                                                NodeType.UNDER_EXPRESSED
                                            );
                                        }}
                                        size="sm"
                                        color="primary"
                                        outline={!selected}
                                    >
                                        <i className="fas fa-level-down-alt fa-fw" />
                                    </Button>
                                    <UncontrolledTooltip
                                        placement="auto"
                                        target={`underexpressed-button-${row.id}`}
                                    >
                                        Set as underexpressed
                                    </UncontrolledTooltip>
                                </>
                            );
                        },
                    },
                    {
                        dataField: "nonexpressed",
                        isDummyField: true,
                        text: "",
                        headerStyle: {
                            width: "60px",
                        },
                        formatter: (_, row) => {
                            const selected =
                                has(selectedNodes, row.id) &&
                                get(selectedNodes, row.id) ===
                                    NodeType.NON_EXPRESSED;
                            return (
                                <>
                                    <Button
                                        id={`nonexpressed-button-${row.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onNodeClick(
                                                row.id,
                                                NodeType.NON_EXPRESSED
                                            );
                                        }}
                                        size="sm"
                                        color="warning"
                                        outline={!selected}
                                    >
                                        <i className="fas fa-ban fa-fw" />
                                    </Button>
                                    <UncontrolledTooltip
                                        placement="auto"
                                        target={`nonexpressed-button-${row.id}`}
                                    >
                                        Set as non-expressed
                                    </UncontrolledTooltip>
                                </>
                            );
                        },
                    },
                    {
                        dataField: "knockedout",
                        isDummyField: true,
                        text: "",
                        headerStyle: {
                            width: "60px",
                        },
                        formatter: (_, row) => {
                            const selected =
                                has(selectedNodes, row.id) &&
                                get(selectedNodes, row.id) ===
                                    NodeType.KNOCKOUT;
                            return (
                                <>
                                    <Button
                                        id={`knockedout-button-${row.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onNodeClick(
                                                row.id,
                                                NodeType.KNOCKOUT
                                            );
                                        }}
                                        size="sm"
                                        color="default"
                                        outline={!selected}
                                    >
                                        <i className="fas fa-times fa-fw" />
                                    </Button>
                                    <UncontrolledTooltip
                                        placement="auto"
                                        target={`knockedout-button-${row.id}`}
                                    >
                                        Set as knocked-out
                                    </UncontrolledTooltip>
                                </>
                            );
                        },
                    },
                ]}
                remote
                bootstrap4
                pagination={pagination}
                filter={filterFactory()}
                bordered={false}
                onTableChange={(_, newState) => {
                    axios
                        .post<State>(
                            route("simulations.nodes.table", organism),
                            {
                                page: newState.page,
                                sizePerPage: newState.sizePerPage,
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
    );
};

export default NodesTable;

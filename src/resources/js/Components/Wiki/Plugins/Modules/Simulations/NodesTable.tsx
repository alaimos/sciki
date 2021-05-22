import React, { useEffect, useMemo, useState } from "react";
import BootstrapTable, {
    ColumnDescription,
    SizePerPageRendererOptions,
    SortOrder,
} from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory from "react-bootstrap-table2-filter";
import ToolkitProvider, {
    Search,
    ToolkitContextType,
} from "react-bootstrap-table2-toolkit";
import axios from "axios";
import route from "ziggy-js";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import { Alert } from "reactstrap";

interface Props {
    simulation: number;
    pathway?: string;
    nodes?: string[];
    sortable?: boolean;
    filterable?: boolean;
    defaultSorting?: { dataField: keyof Node; order: SortOrder };
    onView?: (node: string) => void;
}

export interface Node {
    nodeId: string;
    nodeName: string;
    averagePerturbation: number;
    activityScore: number;
    pValue: number;
    FDR: number;
}

interface State {
    data?: Node[];
    error?: boolean;
    message?: string;
}

const { SearchBar } = Search;

const NodesTable: React.FC<Props> = ({
    simulation,
    pathway,
    nodes,
    sortable = true,
    filterable = true,
    defaultSorting = {
        dataField: "FDR",
        order: "asc",
    },
    onView,
}: Props) => {
    const [state, setState] = useState<State>({
        data: undefined,
    });

    const { data, error, message } = state;

    useEffect(() => {
        if (pathway) {
            const filters = nodes ? { nodes } : {};
            axios
                .post<Record<string, Node>>(
                    route("simulations.plugins.nodesTable", simulation),
                    { pathway, ...filters }
                )
                .then(({ data }) => {
                    setState({
                        data: Object.values(data),
                    });
                })
                .catch((e) => {
                    setState({
                        error: true,
                        message: e.message,
                    });
                });
        }
    }, [simulation, nodes, pathway]);

    const columns: ColumnDescription[] = [
        {
            dataField: "nodeId",
            text: "Id",
            sort: sortable,
        },
        {
            dataField: "nodeName",
            text: "Name",
            sort: sortable,
            classes: "text-truncate",
        },
        {
            dataField: "activityScore",
            text: "Activity Score",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) => row.activityScore.toFixed(4),
        },
        {
            dataField: "averagePerturbation",
            text: "Perturbation",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) => row.averagePerturbation.toFixed(4),
        },
        {
            dataField: "pValue",
            text: "p-value",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) =>
                row.pValue < 0.0001 ? "< 0.0001" : row.pValue.toFixed(4),
        },
        {
            dataField: "FDR",
            text: "FDR",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) =>
                row.FDR < 0.0001 ? "< 0.0001" : row.FDR.toFixed(4),
        },
    ];
    if (onView) {
        columns.push({
            dataField: "view",
            isDummyField: true,
            text: "",
            headerStyle: {
                width: "60px",
            },
            formatter: () => "h",
        });
    }

    const pagination = useMemo(
        () =>
            paginationFactory({
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
        [simulation, pathway, nodes, sortable]
    );

    if (!pathway) {
        return (
            <Alert color="warning">Select a pathway to view its nodes.</Alert>
        );
    }

    if (error) {
        return <p className="text-red">{message}</p>;
    }

    return (
        <ToolkitProvider
            keyField="nodeId"
            data={data ?? []}
            columns={columns}
            search
        >
            {(props: ToolkitContextType) => (
                <div className="py-4">
                    {filterable && (
                        <div className="dataTables_filter px-4 pb-1">
                            <label>
                                Search:
                                <SearchBar
                                    className="form-control-sm"
                                    placeholder=""
                                    {...props.searchProps}
                                />
                            </label>
                        </div>
                    )}
                    <BootstrapTable
                        {...props.baseProps}
                        bootstrap4
                        pagination={pagination}
                        filter={filterFactory()}
                        bordered={false}
                        defaultSorted={[defaultSorting]}
                    />
                </div>
            )}
        </ToolkitProvider>
    );
};

export default NodesTable;

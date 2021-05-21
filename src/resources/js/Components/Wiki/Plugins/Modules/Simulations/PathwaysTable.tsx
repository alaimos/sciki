import React, { useEffect, useMemo, useState } from "react";
// import { has, get } from "lodash";
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
// @ts-ignore
// import overlayFactory from "react-bootstrap-table2-overlay";
import route from "ziggy-js";
// import { Button, UncontrolledTooltip } from "reactstrap";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";

interface Props {
    simulation: number;
    pathways?: string[];
    sortable?: boolean;
    filterable?: boolean;
    defaultSorting?: { dataField: keyof Pathway; order: SortOrder };
    onView?: () => void;
}

interface Pathway {
    pathwayId: string;
    pathwayName: string;
    averagePathwayPerturbation: number;
    pathwayActivityScore: number;
    pathwayPValue: number;
    pathwayFDR: number;
}

interface State {
    data?: Pathway[];
    error?: boolean;
    message?: string;
}

const { SearchBar } = Search;

const PathwaysTable: React.FC<Props> = ({
    simulation,
    pathways,
    sortable = true,
    filterable = true,
    defaultSorting = {
        dataField: "pathwayFDR",
        order: "asc",
    },
    onView,
}: Props) => {
    const [state, setState] = useState<State>({
        data: undefined,
    });

    const { data, error, message } = state;

    useEffect(() => {
        const filters = pathways ? { pathways } : {};
        axios
            .post<Record<string, Pathway>>(
                route("simulations.plugins.pathwaysTable", simulation),
                filters
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
    }, [simulation, pathways]);

    const columns: ColumnDescription[] = [
        {
            dataField: "pathwayId",
            text: "Id",
            sort: sortable,
        },
        {
            dataField: "pathwayName",
            text: "Name",
            sort: sortable,
            classes: "text-truncate",
        },
        {
            dataField: "pathwayActivityScore",
            text: "Activity Score",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) => row.pathwayActivityScore.toFixed(4),
        },
        {
            dataField: "averagePathwayPerturbation",
            text: "Perturbation",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) => row.averagePathwayPerturbation.toFixed(4),
        },
        {
            dataField: "pathwayPValue",
            text: "p-value",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) =>
                row.pathwayPValue < 0.0001
                    ? "< 0.0001"
                    : row.pathwayPValue.toFixed(4),
        },
        {
            dataField: "pathwayFDR",
            text: "FDR",
            sort: sortable,
            classes: "text-truncate",
            formatter: (_, row) =>
                row.pathwayPValue < 0.0001
                    ? "< 0.0001"
                    : row.pathwayFDR.toFixed(4),
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
        [simulation, pathways, sortable]
    );

    if (error) {
        return <p className="text-red">{message}</p>;
    }

    return (
        <ToolkitProvider
            keyField="pathwayId"
            data={data ?? []}
            columns={columns}
            search={filterable}
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
                        filter={filterable ? filterFactory() : undefined}
                        bordered={false}
                        defaultSorted={[defaultSorting]}
                    />
                </div>
            )}
        </ToolkitProvider>
    );
};

export default PathwaysTable;

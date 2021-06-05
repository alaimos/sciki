import React, { useEffect, useMemo, useState } from "react";
import BootstrapTable, {
    ColumnDescription,
    SelectRowProps,
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

interface Props {
    simulation: number;
    pathways?: string[];
    sortable?: boolean;
    filterable?: boolean;
    enableId?: boolean;
    defaultSorting?: { dataField: keyof Pathway; order: SortOrder };
    onSelect?: (pathway: string) => void;
    onView?: (pathway: string) => void;
}

export interface Pathway {
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
    enableId = false,
    defaultSorting = {
        dataField: "pathwayFDR",
        order: "asc",
    },
    onSelect,
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
    if (enableId) {
        columns.unshift({
            dataField: "pathwayId",
            text: "Id",
            sort: sortable,
        });
    }
    if (onView) {
        columns.push({
            dataField: "view",
            isDummyField: true,
            text: "",
            headerStyle: {
                width: "60px",
            },
            formatter: (_, row) => (
                <a
                    className="btn btn-sm btn-link"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onView(row.pathwayId);
                    }}
                >
                    <i className="fas fa-eye fa-fw" />
                </a>
            ),
        });
    }
    const selectRow: SelectRowProps<Pathway> | undefined = onSelect
        ? {
              mode: "checkbox",
              clickToSelect: true,
              hideSelectAll: true,
              onSelect: (row) => onSelect(row.pathwayId),
          }
        : undefined;

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
                        selectRow={selectRow}
                    />
                </div>
            )}
        </ToolkitProvider>
    );
};

export default PathwaysTable;

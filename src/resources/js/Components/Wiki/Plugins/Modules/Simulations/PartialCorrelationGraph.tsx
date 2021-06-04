import React, { useEffect, useState } from "react";
import axios from "axios";
import route from "ziggy-js";
import { Alert } from "reactstrap";
import Plot from "react-plotly.js";
import { useDispatcherEventWithSender } from "../../../../../Hooks/useDispatcherEvent";
import { SelectedSimulation } from "./CorrelationGraph";

interface Props {
    id?: string;
    simulation: number;
    compareWith?: number;
    fn?: "pearson" | "spearman";
    top?: boolean;
    n?: number;
    direction?: "positive" | "negative" | "both";
    useEndpoints?: boolean;
    usePerturbation?: boolean;
    title?: string;
    height?: number;
    connectedTo?: string;
}

interface Data {
    x: string[];
    y: number[];
}

interface State {
    data?: Data;
    error?: boolean;
    message?: string;
}

interface SelectionState {
    compareWith?: number;
    fn?: "pearson" | "spearman";
    useEndpoints?: boolean;
    usePerturbation?: boolean;
}

const PartialCorrelationGraph: React.FC<Props> = ({
    simulation,
    title,
    height = 600,
    top = false,
    n = 10,
    direction = "negative",
    connectedTo,
    ...selectionProps
}: Props) => {
    const [state, setState] = useState<State>({});
    const [selectionState, setSelectionState] = useState<SelectionState>({
        compareWith: selectionProps.compareWith,
        fn: selectionProps.fn,
        useEndpoints: selectionProps.useEndpoints,
        usePerturbation: selectionProps.useEndpoints,
    });

    const { data, error, message } = state;
    const { compareWith, fn, useEndpoints, usePerturbation } = selectionState;

    useEffect(() => {
        setState({});
        if (compareWith && compareWith > 0) {
            axios
                .post<Data>(
                    route("simulations.plugins.partialCorrelation", simulation),
                    {
                        compareWith,
                        fn,
                        top,
                        n,
                        direction,
                        useEndpoints,
                        usePerturbation,
                    }
                )
                .then(({ data }) => {
                    setState({ data });
                })
                .catch((e) => {
                    setState({
                        error: true,
                        message: e.response.data.message ?? e.message,
                    });
                });
        }
    }, [
        simulation,
        compareWith,
        fn,
        top,
        n,
        direction,
        useEndpoints,
        usePerturbation,
    ]);

    useDispatcherEventWithSender<SelectedSimulation>(
        "onCorrelationGraphBarClick",
        (selection) => {
            setSelectionState((prevState) => ({
                ...prevState,
                ...selection,
            }));
        },
        connectedTo,
        [setSelectionState]
    );

    if (!compareWith || compareWith < 0) {
        return (
            <Alert color="primary">
                <i className="fas fa-exclamation-circle mx-2" />
                Click on a bar in the correlation graph to display its details.
            </Alert>
        );
    }

    if (error) {
        return <p className="text-red">{message}</p>;
    }

    const min = data ? Math.min(...data.y) : 0;
    const max = data ? Math.max(...data.y) : 0;
    const range = Math.max(Math.abs(min), Math.abs(max));
    const cmin = -range;
    // const cdiff = data ? cmax - cmin : 0;

    return (
        <>
            {!!data && (
                <>
                    <div className="d-flex flex-grow-1">
                        <Plot
                            data={[
                                {
                                    ...data,
                                    type: "bar",
                                    marker: {
                                        color: data.y,
                                        cmin: cmin,
                                        cmax: range,
                                        colorscale: [
                                            [0, "rgb(5,10,172)"],
                                            [0.35, "rgb(106,137,247)"],
                                            [0.5, "rgb(255,255,255)"],
                                            [0.6, "rgb(220,170,132)"],
                                            [0.7, "rgb(230,145,90)"],
                                            [1, "rgb(178,10,28)"],
                                        ],
                                        showscale: true,
                                    },
                                },
                            ]}
                            layout={{
                                bargap: 0,
                                yaxis: {
                                    title:
                                        fn === "pearson"
                                            ? "Pearson Correlation"
                                            : "Spearman Correlation",
                                    // range: [-1, 1],
                                },
                                font: { size: 12 },
                                autosize: true,
                                showlegend: false,
                                title,
                            }}
                            config={{
                                responsive: true,
                            }}
                            style={{
                                width: "100%",
                                height: `${height}px`,
                            }}
                            useResizeHandler
                        />
                    </div>
                </>
            )}
            {!data && (
                <Alert color="primary">
                    <i className="fas fa-circle-notch fa-spin mx-2" />
                    Building image. Please wait...
                </Alert>
            )}
        </>
    );
};

export default PartialCorrelationGraph;

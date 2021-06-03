import React, { useEffect, useState } from "react";
import axios from "axios";
import route from "ziggy-js";
import { Alert } from "reactstrap";
import Plot from "react-plotly.js";
import { useDispatcher } from "../../../../../Contexts/DispatcherProvider";

export interface SelectedSimulation {
    sender: string;
    compareWith: number;
    fn?: "pearson" | "spearman";
    useEndpoints: boolean;
    usePerturbation: boolean;
}

interface Props {
    id?: string;
    simulation: number;
    fn?: "pearson" | "spearman";
    top?: boolean;
    n?: number;
    direction?: "positive" | "negative";
    useEndpoints?: boolean;
    usePerturbation?: boolean;
    findByTags: string[];
    searchMode?: "all" | "any";
    title?: string;
    height?: number;
}

type CustomData = [number, "pearson" | "spearman", number, number];

interface Data {
    x: string[];
    y: number[];
    customdata: CustomData[];
}

interface State {
    data?: Data;
    error?: boolean;
    message?: string;
}

const CorrelationGraph: React.FC<Props> = ({
    id,
    simulation,
    title,
    height = 600,
    fn = "pearson",
    top = false,
    n = 10,
    direction = "negative",
    useEndpoints = true,
    usePerturbation = false,
    findByTags,
    searchMode = "all",
}: Props) => {
    const [state, setState] = useState<State>({});
    const dispatcher = useDispatcher();

    const { data, error, message } = state;

    useEffect(() => {
        setState({});
        axios
            .post<Data>(route("simulations.plugins.correlation", simulation), {
                fn,
                top,
                n,
                direction,
                useEndpoints,
                usePerturbation,
                findByTags,
                searchMode,
            })
            .then(({ data }) => {
                setState({ data });
            })
            .catch((e) => {
                setState({
                    error: true,
                    message: e.response.data.message ?? e.message,
                });
            });
    }, [
        simulation,
        fn,
        top,
        n,
        direction,
        useEndpoints,
        usePerturbation,
        findByTags,
        searchMode,
    ]);

    if (error) {
        return <p className="text-red">{message}</p>;
    }

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
                                        color: data.y.map((y) => (y + 1) / 2),
                                        cmin: -1,
                                        cmax: 1,
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
                                    range: [-1, 1],
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
                            onClick={(event) => {
                                if (id && event.points.length > 0) {
                                    const point = event.points[0];
                                    const data =
                                        point.customdata as unknown as CustomData;
                                    dispatcher.dispatch<SelectedSimulation>(
                                        "onCorrelationGraphBarClick",
                                        {
                                            sender: id,
                                            compareWith: data[0],
                                            fn: data[1],
                                            useEndpoints: !!data[2],
                                            usePerturbation: !!data[3],
                                        }
                                    );
                                }
                            }}
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

export default CorrelationGraph;

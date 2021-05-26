import React, { useEffect, useState } from "react";
import axios from "axios";
import route from "ziggy-js";
import { Alert } from "reactstrap";
import Plot from "react-plotly.js";

interface Props {
    simulation: number;
    type?: "pathways" | "nodes";
    mode?: "top" | "selected";
    selection?: string[];
    sortBy?: "perturbation" | "activity";
    n?: number;
    absolute?: boolean;
    limit?: "none" | "positive" | "negative";
    attach?: {
        tags?: string[];
        mode?: "all" | "any";
        simulations?: string[];
    };
    title?: string;
    height?: number;
}

interface Data {
    x: string[];
    y: string[];
    z: number[][];
}

interface State {
    data?: Data;
    error?: boolean;
    message?: string;
}

const SimulationHeatmap: React.FC<Props> = ({
    simulation,
    title,
    height = 600,
    type = "pathways",
    mode = "top",
    selection,
    sortBy = "perturbation",
    n = 10,
    absolute = false,
    limit = "none",
    attach = {},
}: Props) => {
    const [state, setState] = useState<State>({});

    const { data, error, message } = state;

    useEffect(() => {
        axios
            .post<Data>(route("simulations.plugins.heatmap", simulation), {
                type,
                mode,
                selection,
                sort_by: sortBy,
                n,
                absolute,
                limit,
                attach,
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
    }, [simulation, type, mode, selection, sortBy, n, absolute, limit, attach]);

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
                                    type: "heatmap",
                                    colorscale: "Picnic",
                                },
                            ]}
                            layout={{
                                font: { size: 12 },
                                autosize: true,
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

export default SimulationHeatmap;

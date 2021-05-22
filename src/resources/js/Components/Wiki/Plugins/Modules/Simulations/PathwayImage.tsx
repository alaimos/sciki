import React, { useEffect, useState } from "react";
import axios from "axios";
import route from "ziggy-js";
import { Alert, Button, Modal } from "reactstrap";
import classNames from "classnames";

interface Props {
    simulation: number;
    pathway?: string;
    legend?: string;
    position?: "left" | "center" | "right";
}

interface State {
    data?: string;
    error?: boolean;
    message?: string;
}

const PathwayImage: React.FC<Props> = ({
    simulation,
    pathway,
    position = "center",
    legend,
}: Props) => {
    const [state, setState] = useState<State>({});
    const [shown, setShown] = useState(false);

    const { data, error, message } = state;

    useEffect(() => {
        if (pathway) {
            axios
                .post<{ data: string }>(
                    route("simulations.plugins.pathwayImage", simulation),
                    { pathway }
                )
                .then(({ data }) => {
                    setState(data);
                })
                .catch((e) => {
                    setState({
                        error: true,
                        message: e.message,
                    });
                });
        }
    }, [simulation, pathway]);

    const toggleModal = () => setShown((prevState) => !prevState);

    if (!pathway) {
        return (
            <Alert color="warning">Select a pathway to view its image.</Alert>
        );
    }

    if (error) {
        return <p className="text-red">{message}</p>;
    }

    return (
        <>
            {!!data && (
                <>
                    {["left", "right"].includes(position) && (
                        <div
                            className={classNames({
                                figure: true,
                                fig_left: position === "left",
                                fig_right: position === "right",
                            })}
                        >
                            <div className="fig_container">
                                <a
                                    href="#"
                                    className="fig"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShown(true);
                                    }}
                                >
                                    <img src={data} alt={pathway} />
                                </a>
                                <div className="fig_caption">{legend}</div>
                            </div>
                        </div>
                    )}
                    {position === "center" && (
                        <div className="d-flex justify-content-center">
                            <div className="figure" style={{ width: "50%" }}>
                                <div className="fig_container">
                                    <a
                                        href="#"
                                        className="fig"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShown(true);
                                        }}
                                    >
                                        <img
                                            src={data}
                                            alt={pathway}
                                            className="centered"
                                        />
                                    </a>
                                    <div className="fig_caption">{legend}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <Modal
                        className="modal-dialog-centered"
                        isOpen={shown}
                        toggle={() => toggleModal()}
                        style={{
                            maxWidth: "100vw",
                        }}
                    >
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                {legend}
                            </h5>
                            <button
                                aria-label="Close"
                                className="close"
                                data-dismiss="modal"
                                type="button"
                                onClick={() => toggleModal()}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <img
                                src={data}
                                alt={pathway}
                                style={{ width: "100%" }}
                            />
                        </div>
                        <div className="modal-footer">
                            <Button
                                color="primary"
                                data-dismiss="modal"
                                type="button"
                                onClick={() => toggleModal()}
                            >
                                Close
                            </Button>
                        </div>
                    </Modal>
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

export default PathwayImage;

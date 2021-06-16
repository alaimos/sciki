import React, { useRef, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Modal,
    Row,
    UncontrolledTooltip,
} from "reactstrap";
import Uppy from "@uppy/core";
import Xhr from "@uppy/xhr-upload";
import ImageEditor from "@uppy/image-editor";
import { DashboardModal, useUppy } from "@uppy/react";
import route from "ziggy-js";
import Cookies from "browser-cookies";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";
import "../../../css/Components/Wiki/MediaManager.css";
import axios from "axios";
import classNames from "classnames";

export interface Media {
    id: number;
    uuid: string;
    title: string;
    legend: string;
    url: string;
    thumbs: {
        small: string;
        large: string;
    };
    srcset: string;
}

interface Props {
    currentPageSlug: string;
    media: Record<string, Media>;
    enableFeatured?: boolean;
    featuredId?: number;
    deletedMedia: string[];
    onMediaSelect: (media: Media) => void;
    onFeaturedSelect?: (media: Media) => void;
    onMediaUpdate: (media: Media) => void;
    onMediaUpload: (newMedia: Media) => void;
    onMediaDelete: (uuid: string) => void;
}

interface EditState {
    open: boolean;
    media?: Media;
    processing?: boolean;
    errors?: {
        title?: string[];
        legend?: string[];
    };
}

const MediaManager: React.FC<Props> = ({
    currentPageSlug,
    media,
    enableFeatured = false,
    featuredId,
    deletedMedia,
    onMediaUpload,
    onMediaUpdate,
    onMediaSelect,
    onFeaturedSelect,
    onMediaDelete,
}: Props) => {
    const isFeaturedEnabled = enableFeatured && onFeaturedSelect;
    const titleRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const legendRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const uppy = useUppy(() => {
        const instance = new Uppy.Uppy({
            restrictions: {
                allowedFileTypes: ["image/*"],
            },
        });
        instance.use(Xhr, {
            fieldName: "file",
            endpoint: route("page.media.upload", currentPageSlug),
            headers: {
                "X-XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
                accept: "application/json",
            },
            getResponseError(
                responseText: string,
                response: XMLHttpRequest
            ): Error {
                const jsonResponse = JSON.parse(responseText);
                if (
                    response.status === 422 &&
                    jsonResponse.errors &&
                    jsonResponse.errors.file
                ) {
                    if (
                        Array.isArray(jsonResponse.errors.file) &&
                        jsonResponse.errors.file[0]
                    ) {
                        return new Error(
                            jsonResponse.errors.file[0] || "Unknown error"
                        );
                    }
                    return new Error(
                        jsonResponse.errors.file || "Unknown error"
                    );
                }
                return new Error(jsonResponse?.message || "Unknown error");
            },
        });
        instance.use(ImageEditor, {
            quality: 0.8,
        });
        instance.on("upload-success", (_, response) => {
            onMediaUpload(response.body.media as Media);
        });
        return instance;
    });
    const [uploadOpen, setUploadOpen] = useState(false);
    const [editState, setEditState] = useState({ open: false } as EditState);
    const toggleEdit = () =>
        setEditState((prevState) => ({
            ...prevState,
            open: !prevState.open,
        }));
    const setProcessing = (processing: boolean) =>
        setEditState((prevState) => ({
            ...prevState,
            processing,
        }));
    const saveMedia = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setProcessing(true);
        try {
            setEditState({ open: false });
            const result = await axios.put(
                route("page.media.update", [
                    currentPageSlug,
                    editState.media?.uuid || "",
                ]),
                {
                    title: titleRef?.current?.value,
                    legend: legendRef?.current?.value,
                }
            );
            const media: Media = result.data.media;
            onMediaUpdate(media);
        } catch (e) {
            if (e.response.data.errors) {
                setEditState((prevState) => ({
                    ...prevState,
                    errors: e.response.data.errors,
                }));
            }
        }
        setProcessing(false);
    };

    return (
        <>
            <Row>
                <Col className="mb-5 mb-xl-2" md="12">
                    <Card className="bg-gradient-dark shadow">
                        <CardHeader className="bg-transparent">
                            <Row className="justify-content-between align-items-center">
                                <div className="col">
                                    <h6 className="text-uppercase text-light ls-1 mb-1">
                                        Page Media
                                    </h6>
                                </div>
                                <div className="col d-flex justify-content-end">
                                    <a
                                        className="btn btn-outline-light btn-sm"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUploadOpen(true);
                                        }}
                                    >
                                        <i className="fas fa-plus mr-2" />
                                        Add media
                                    </a>
                                </div>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <div
                                className="MediaManagerList overflow-auto"
                                style={{
                                    maxHeight: "200px",
                                }}
                            >
                                {Object.values(media)
                                    .filter(
                                        (m) => !deletedMedia.includes(m.uuid)
                                    )
                                    .map((m) => (
                                        <div key={m.uuid}>
                                            <div
                                                className="PreviewContainer"
                                                style={{
                                                    background: `url('${m.thumbs.large}') no-repeat center center`,
                                                }}
                                                onClick={() => onMediaSelect(m)}
                                            >
                                                <div className="text-green opacity-10">
                                                    <i className="fas fa-2x fa-check" />
                                                </div>
                                            </div>
                                            <div className="TitleContainer">
                                                <div
                                                    className="text-light"
                                                    title={m.title}
                                                >
                                                    {m.title}
                                                </div>
                                                <div>
                                                    <CopyToClipboard
                                                        text={m.uuid}
                                                    >
                                                        <a
                                                            id={`CopyToClipboardMediaTooltip${m.uuid}`}
                                                            href="#"
                                                            onClick={(e) =>
                                                                e.preventDefault()
                                                            }
                                                            title="Copy Id to Clipboard"
                                                        >
                                                            <i className="fas fa-clipboard" />
                                                        </a>
                                                    </CopyToClipboard>
                                                    <UncontrolledTooltip
                                                        placement="auto"
                                                        target={`CopyToClipboardMediaTooltip${m.uuid}`}
                                                    >
                                                        Copy Id to Clipboard
                                                    </UncontrolledTooltip>
                                                </div>
                                                {isFeaturedEnabled && (
                                                    <div>
                                                        <a
                                                            id={`FeatureMediaTooltip${m.uuid}`}
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (
                                                                    onFeaturedSelect
                                                                )
                                                                    onFeaturedSelect(
                                                                        m
                                                                    );
                                                            }}
                                                            className="text-danger"
                                                            title="Mark as featured"
                                                        >
                                                            {featuredId ===
                                                            m.id ? (
                                                                <i className="fas fa-star" />
                                                            ) : (
                                                                <i className="far fa-star" />
                                                            )}
                                                        </a>
                                                        <UncontrolledTooltip
                                                            placement="auto"
                                                            target={`FeatureMediaTooltip${m.uuid}`}
                                                        >
                                                            Mark as featured
                                                        </UncontrolledTooltip>
                                                    </div>
                                                )}
                                                <div>
                                                    <a
                                                        id={`EditMediaTooltip${m.uuid}`}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setEditState({
                                                                open: true,
                                                                media: m,
                                                            });
                                                        }}
                                                        title="Edit media"
                                                    >
                                                        <i className="fas fa-pencil-alt" />
                                                    </a>
                                                    <UncontrolledTooltip
                                                        placement="auto"
                                                        target={`EditMediaTooltip${m.uuid}`}
                                                    >
                                                        Edit Title and Legend
                                                    </UncontrolledTooltip>
                                                </div>
                                                <div>
                                                    <a
                                                        id={`DeleteMediaTooltip${m.uuid}`}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onMediaDelete(
                                                                m.uuid
                                                            );
                                                        }}
                                                        className="text-danger"
                                                        title="Delete media"
                                                    >
                                                        <i className="fas fa-trash" />
                                                    </a>
                                                    <UncontrolledTooltip
                                                        placement="auto"
                                                        target={`DeleteMediaTooltip${m.uuid}`}
                                                    >
                                                        Delete media
                                                    </UncontrolledTooltip>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <DashboardModal
                uppy={uppy}
                closeModalOnClickOutside
                open={uploadOpen}
                onRequestClose={() => setUploadOpen(false)}
                fileManagerSelectionType="files"
                theme="dark"
                plugins={["ImageEditor"]}
            />
            <Modal
                className="modal-dialog-centered"
                isOpen={editState.open}
                toggle={toggleEdit}
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        Edit {editState.media?.title}
                    </h5>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={toggleEdit}
                    >
                        <span aria-hidden={true}>×</span>
                    </button>
                </div>
                <div className="modal-body">
                    <FormGroup
                        className={classNames({
                            "has-danger":
                                editState.errors?.title &&
                                !!editState.errors?.title[0],
                        })}
                    >
                        <Label for="mediaTitle">Title</Label>
                        <Input
                            name="mediaTitle"
                            placeholder="Insert title here"
                            type="text"
                            innerRef={titleRef}
                            invalid={
                                editState.errors?.title &&
                                !!editState.errors?.title[0]
                            }
                            defaultValue={editState.media?.title}
                        />
                        <FormFeedback tag="span" className="invalid-feedback">
                            <strong>
                                {editState.errors?.title &&
                                    editState.errors?.title[0]}
                            </strong>
                        </FormFeedback>
                    </FormGroup>
                    <FormGroup
                        className={classNames({
                            "has-danger":
                                editState.errors?.legend &&
                                !!editState.errors?.legend[0],
                        })}
                    >
                        <Label for="mediaLegend">Legend</Label>
                        <Input
                            name="mediaLegend"
                            placeholder="Insert the legend here"
                            type="textarea"
                            innerRef={legendRef}
                            invalid={
                                editState.errors?.legend &&
                                !!editState.errors?.legend[0]
                            }
                            defaultValue={editState.media?.legend}
                        />
                        <FormFeedback tag="span" className="invalid-feedback">
                            <strong>
                                {editState.errors?.legend &&
                                    editState.errors?.legend[0]}
                            </strong>
                        </FormFeedback>
                    </FormGroup>
                </div>
                <div className="modal-footer">
                    <Button
                        color="secondary"
                        data-dismiss="modal"
                        type="button"
                        onClick={toggleEdit}
                    >
                        Close
                    </Button>
                    <Button
                        color="primary"
                        type="button"
                        disabled={editState.processing}
                        onClick={saveMedia}
                    >
                        <i
                            className={
                                editState.processing
                                    ? "fas fa-spinner fa-spin mr-2"
                                    : "fa fa-save mr-2"
                            }
                        />
                        Save changes
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default MediaManager;

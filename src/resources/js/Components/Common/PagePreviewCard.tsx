import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { Media } from "../Wiki/MediaManager";
import { InertiaLink } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import classNames from "classnames";

interface Props {
    title: string;
    page: { slug: string };
    previewImage?: Media;
    previewText: string;
    dark?: boolean;
}

const PagePreviewCard: React.FC<Props> = ({
    title,
    page: { slug: pageSlug },
    previewImage,
    previewText,
    dark = false,
}: Props) => {
    return (
        <Card
            className={classNames("shadow", {
                "bg-gradient-dark": dark,
            })}
        >
            <CardHeader className="bg-transparent">
                <h6
                    className={classNames({
                        "text-uppercase": true,
                        "ls-1": true,
                        "mb-1": true,
                        "text-dark": !dark,
                        "text-light": dark,
                    })}
                >
                    {title}
                </h6>
            </CardHeader>
            <CardBody
                className={classNames({
                    "text-light": dark,
                })}
            >
                {!!previewImage && (
                    <img
                        src={previewImage.thumbs.large}
                        alt={previewImage.legend}
                        className="rounded float-left mr-1 mb-1 shadow d-none d-md-block"
                    />
                )}
                <div
                    className="text-justify"
                    dangerouslySetInnerHTML={{
                        __html: previewText,
                    }}
                />
                <div>
                    <InertiaLink href={route("wiki.show", pageSlug)}>
                        See more...
                    </InertiaLink>
                </div>
            </CardBody>
        </Card>
    );
};

export default PagePreviewCard;

import React from "react";
import { Card, CardBody, Input } from "reactstrap";
import { useForm } from "@inertiajs/inertia-react";
import route from "ziggy-js";

interface Props {
    slug: string;
    userIsLoggedIn: boolean;
    currentUserAvatar?: string;
    currentUserEmail?: string;
}

const PostCommentForm: React.FC<Props> = ({
    slug: pageSlug,
    userIsLoggedIn,
    currentUserAvatar,
    currentUserEmail,
}: Props) => {
    const { data, setData, post, processing, reset } = useForm({
        comment: "",
    });

    return (
        <>
            {userIsLoggedIn && (
                <Card className="p-0 mt-2">
                    <CardBody className="p-0 bg-light d-flex flex-column">
                        <div className="p-2">
                            <div className="d-flex flex-row align-items-start">
                                <img
                                    className="rounded-circle"
                                    src={currentUserAvatar}
                                    alt={currentUserEmail}
                                    width="40"
                                />
                                <Input
                                    type="textarea"
                                    className="ml-1 shadow-none textarea"
                                    value={data.comment}
                                    onChange={(e) =>
                                        setData("comment", e.target.value)
                                    }
                                />
                            </div>
                            <div className="mt-2 text-right">
                                <button
                                    className="btn btn-primary btn-sm shadow-none"
                                    type="button"
                                    disabled={processing}
                                    onClick={() =>
                                        post(
                                            route(
                                                "wiki.comments.store",
                                                pageSlug
                                            ),
                                            {
                                                preserveState: false,
                                            }
                                        )
                                    }
                                >
                                    Post comment
                                </button>
                                <button
                                    className="btn btn-outline-primary btn-sm ml-1 shadow-none"
                                    type="button"
                                    disabled={processing}
                                    onClick={() => reset()}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </>
    );
};

export default PostCommentForm;

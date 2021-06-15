import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
import route from "ziggy-js";
import { AuthUser } from "../../../Types/page";
import axios from "../../../Common/axios";
import Vote from "../Vote";

export interface Comment {
    id: number;
    comment: string;
    created_at: string;
    readable_created_at: string;
    user: AuthUser;
    current_user_vote: number | null;
    votes_sum_vote: number;
    can_delete: boolean;
}

interface Props {
    userIsLoggedIn: boolean;
    comment: Comment;
    onDeleteComment?: (id: number) => void;
}
const CommentCard: React.FC<Props> = ({
    comment,
    userIsLoggedIn,
    onDeleteComment,
}: Props) => {
    const [isDeleted, setIsDeleted] = useState(false);

    const doDelete = async () => {
        if (comment.can_delete) {
            const response = await axios.delete(
                route("comments.destroy", comment.id)
            );
            if (response.status === 200 && onDeleteComment) {
                setIsDeleted(true);
                onDeleteComment(comment.id);
            }
        }
    };

    return (
        <>
            <Card className="p-0 comment">
                <CardBody className="p-0 d-flex flex-column bg-white">
                    <div className="p-2">
                        <div className="d-flex flex-row user-info align-items-center">
                            <img
                                className="rounded-circle"
                                src={comment.user.avatar.small}
                                alt={comment.user.name}
                                width="40"
                                height="40"
                            />
                            <div className="d-flex flex-column justify-content-start ml-2 flex-grow-1">
                                <span className="d-block font-weight-bold text-primary">
                                    {comment.user.name}
                                </span>
                                <span className="date text-gray-dark text-sm">
                                    {comment.readable_created_at}
                                </span>
                            </div>
                            {comment.can_delete && !isDeleted && (
                                <div className="m-2">
                                    <a
                                        href="#"
                                        className="text-red"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            return doDelete();
                                        }}
                                    >
                                        <i className="fas fa-trash" />
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-dark">
                            <p className="comment-text">{comment.comment}</p>
                        </div>
                    </div>
                    {userIsLoggedIn && (
                        <Vote
                            object={comment}
                            idKey="id"
                            commentRoute="comments.vote"
                        />
                    )}
                </CardBody>
            </Card>
        </>
    );
};

export default CommentCard;

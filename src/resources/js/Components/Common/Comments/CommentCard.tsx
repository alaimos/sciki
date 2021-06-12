import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
import route from "ziggy-js";
import { AuthUser } from "../../../Types/page";
import axios from "../../../Common/axios";
import classNames from "classnames";

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

interface CommentVoteResponse {
    current_user_vote: number;
    total_votes: number;
}

interface Props {
    userIsLoggedIn: boolean;
    comment: Comment;
    onDeleteComment?: (id: number) => void;
}

interface State {
    deleted?: boolean;
    voting?: boolean;
    currentUserVote: number;
    totalVote: number;
}

const CommentCard: React.FC<Props> = ({
    comment,
    userIsLoggedIn,
    onDeleteComment,
}: Props) => {
    const [state, setState] = useState<State>({
        currentUserVote: comment.current_user_vote ?? 0,
        totalVote: comment.votes_sum_vote,
    });
    const doVote = async (vote: number) => {
        if (state.voting) return;
        setState((prevState) => ({ ...prevState, voting: true }));
        const response = await axios.post<CommentVoteResponse>(
            route("comments.vote", comment.id),
            {
                vote,
            }
        );
        setState({
            currentUserVote: response.data.current_user_vote,
            totalVote: response.data.total_votes ?? 0,
        });
    };
    const doDelete = async () => {
        if (comment.can_delete) {
            const response = await axios.delete(
                route("comments.destroy", comment.id)
            );
            if (response.status === 200 && onDeleteComment) {
                setState((prevState) => ({ ...prevState, deleted: true }));
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
                            {comment.can_delete && !state.deleted && (
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
                        <div>
                            <div className="d-flex flex-row text-sm">
                                <div
                                    className={classNames({
                                        like: true,
                                        "p-2": true,
                                        cursor: true,
                                        selected: state.currentUserVote === 1,
                                    })}
                                    onClick={() => doVote(+1)}
                                >
                                    <i className="fas fa-thumbs-up" />
                                    <span className="ml-1">Up-vote</span>
                                </div>
                                <div className="p-2" title="Votes">
                                    <i className="fas fa-vote-yea" />
                                    <span className="ml-1">
                                        {state.totalVote}
                                    </span>
                                </div>
                                <div
                                    className={classNames({
                                        like: true,
                                        "p-2": true,
                                        cursor: true,
                                        selected: state.currentUserVote === -1,
                                    })}
                                    onClick={() => doVote(-1)}
                                >
                                    <i className="fas fa-thumbs-down" />
                                    <span className="ml-1">Down-vote</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </>
    );
};

export default CommentCard;

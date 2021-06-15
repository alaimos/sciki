import React, { useState } from "react";
import route from "ziggy-js";
import axios from "../../Common/axios";
import classNames from "classnames";

export interface Voteable {
    current_user_vote: number | null;
    votes_sum_vote: number;
}

interface CommentVoteResponse {
    current_user_vote: number;
    total_votes: number;
}

interface Props<T extends Voteable = Voteable> {
    object: T;
    idKey: string;
    commentRoute: string;
}

interface State {
    voting?: boolean;
    currentUserVote: number;
    totalVote: number;
}

const Vote: React.FC<Props> = ({ object, idKey, commentRoute }: Props) => {
    const [state, setState] = useState<State>({
        currentUserVote: object.current_user_vote ?? 0,
        totalVote: object.votes_sum_vote,
    });
    const doVote = async (vote: number) => {
        if (state.voting) return;
        setState((prevState) => ({ ...prevState, voting: true }));
        const response = await axios.post<CommentVoteResponse>(
            // @ts-ignore
            route(commentRoute, object[idKey]),
            {
                vote,
            }
        );
        setState({
            currentUserVote: response.data.current_user_vote,
            totalVote: response.data.total_votes ?? 0,
        });
    };

    return (
        <div className="vote">
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
                    <span className="ml-1">{state.totalVote}</span>
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
    );
};

export default Vote;

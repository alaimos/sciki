import React, { useState } from "react";
import { NavItem, NavLink } from "reactstrap";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";
import WikiPageHeader from "../../Components/Wiki/WikiPageHeader";
import PostCommentForm from "../../Components/Common/Comments/PostCommentForm";
import CommentCard, {
    Comment,
} from "../../Components/Common/Comments/CommentCard";

interface Props extends CommonPageProps {
    slug: string;
    title: string;
    draft: boolean;
    comments: {
        data: Comment[];
    };
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

const Page: React.FC<Props> = ({
    auth: { check: userIsLoggedIn, user: user },
    comments: { data: comments },
    slug: pageSlug,
    title,
    can: { update: userCanUpdate, delete: userCanDelete },
}: Props) => {
    const [deletedComments, setDeletedComments] = useState<number[]>([]);
    const userAvatarSmall = user ? user.avatar.small : undefined;
    return (
        <WikiPageHeader
            userIsLoggedIn={userIsLoggedIn}
            pageSlug={pageSlug}
            title={`Comments of ${title}`}
            userCanUpdate={userCanUpdate}
            userCanDelete={userCanDelete}
            customNavButtons={[
                <NavItem className="ml-2 flex-grow-0" key="wiki.show">
                    <NavLink
                        className="mb-sm-3 mb-md-0"
                        tag={InertiaLink}
                        href={route("wiki.show", pageSlug)}
                    >
                        <i className="fas fa-eye mr-2" />
                        View page
                    </NavLink>
                </NavItem>,
            ]}
        >
            <div className="d-flex justify-content-center row">
                <div className="col-md-12">
                    {comments
                        .filter((c) => !deletedComments.includes(c.id))
                        .map((c) => (
                            <CommentCard
                                userIsLoggedIn={userIsLoggedIn}
                                comment={c}
                                key={c.id}
                                onDeleteComment={(id) =>
                                    setDeletedComments((prevState) => [
                                        ...prevState,
                                        id,
                                    ])
                                }
                            />
                        ))}
                    <PostCommentForm
                        slug={pageSlug}
                        userIsLoggedIn={userIsLoggedIn}
                        currentUserAvatar={userAvatarSmall}
                        currentUserEmail={user?.email}
                    />
                </div>
            </div>
        </WikiPageHeader>
    );
};

export default Page;

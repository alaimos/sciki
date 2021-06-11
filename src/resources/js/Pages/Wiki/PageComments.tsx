import React from "react";
import { Card, CardBody, Input, NavItem, NavLink } from "reactstrap";
import { CommonPageProps } from "../../Types/page";
import route from "ziggy-js";
import { InertiaLink } from "@inertiajs/inertia-react";
import WikiPageHeader from "../../Components/Wiki/WikiPageHeader";

interface Props extends CommonPageProps {
    slug: string;
    title: string;
    draft: boolean;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

const Page: React.FC<Props> = ({
    auth: { check: userIsLoggedIn, user: user },
    slug: pageSlug,
    title,
    can: { update: userCanUpdate, delete: userCanDelete },
}: Props) => {
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
                    <Card className="p-0">
                        <CardBody className="p-0 d-flex flex-column bg-white">
                            <div className="p-2">
                                <div className="d-flex flex-row user-info">
                                    <img
                                        className="rounded-circle"
                                        src="https://i.imgur.com/RpzrMR2.jpg"
                                        width="40"
                                    />
                                    <div className="d-flex flex-column justify-content-start ml-2">
                                        <span className="d-block font-weight-bold name">
                                            Marry Andrews
                                        </span>
                                        <span className="date text-black-50">
                                            XXX days ago
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="comment-text">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit, sed do eiusmod tempor
                                        incididunt ut labore et dolore magna
                                        aliqua. Ut enim ad minim veniam, quis
                                        nostrud exercitation ullamco laboris
                                        nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    {userIsLoggedIn && (
                        <Card className="p-0 mt-2">
                            <CardBody className="p-0 bg-light d-flex flex-column">
                                <div className="p-2">
                                    <div className="d-flex flex-row align-items-start">
                                        <img
                                            className="rounded-circle"
                                            src={userAvatarSmall}
                                            alt={user?.email}
                                            width="40"
                                        />
                                        <Input
                                            type="textarea"
                                            className="ml-1 shadow-none textarea"
                                        />
                                    </div>
                                    <div className="mt-2 text-right">
                                        <button
                                            className="btn btn-primary btn-sm shadow-none"
                                            type="button"
                                        >
                                            Post comment
                                        </button>
                                        <button
                                            className="btn btn-outline-primary btn-sm ml-1 shadow-none"
                                            type="button"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </WikiPageHeader>
    );
};

export default Page;

import React, { useCallback } from "react";
import {
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    DropdownToggle,
    Media,
} from "reactstrap";
import { InertiaLink, usePage } from "@inertiajs/inertia-react";
import { Page } from "@inertiajs/inertia";
import { Inertia } from "@inertiajs/inertia";
import route from "ziggy-js";
import { CommonPageProps } from "../../../../Types/page";

interface Props {
    showUserName?: boolean;
}

const UserDropdown: React.FC<Props> = ({ showUserName }: Props) => {
    const { auth } = usePage<Page<CommonPageProps>>().props;
    const handleLogout = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            3;
            e.preventDefault();
            return Inertia.post(route("logout"));
        },
        [auth]
    );

    return (
        <>
            {auth.user && (
                <UncontrolledDropdown nav>
                    <DropdownToggle nav>
                        <Media className="align-items-center">
                            <span className="avatar avatar-sm rounded-circle">
                                <img
                                    alt={auth.user.name}
                                    src={auth.user.avatar.small}
                                />
                            </span>
                            {showUserName && (
                                <Media className="ml-2 d-none d-lg-block">
                                    <span className="mb-0 text-sm font-weight-bold">
                                        {auth.user.name}
                                    </span>
                                </Media>
                            )}
                        </Media>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-arrow" right>
                        <DropdownItem className="noti-title" header tag="div">
                            <h6 className="text-overflow m-0">Welcome!</h6>
                        </DropdownItem>
                        <DropdownItem href={route("home")} tag={InertiaLink}>
                            <i className="ni ni-single-02" />
                            <span>My profile</span>
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem href="#logout" onClick={handleLogout}>
                            <i className="ni ni-user-run" />
                            <span>Logout</span>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            )}
        </>
    );
};

export default UserDropdown;

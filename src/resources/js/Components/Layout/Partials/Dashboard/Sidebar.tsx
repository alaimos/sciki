import React, { useState } from "react";
import {
    Collapse,
    NavbarBrand,
    Navbar,
    Nav,
    Container,
    Row,
    Col,
    NavItem,
    NavLink,
} from "reactstrap";
import { InertiaLink, usePage } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import UserDropdown from "./UserDropdown";
import Search from "./Search";
import { CommonPageProps, GuiLink } from "../../../../Types/page";
import { Page } from "@inertiajs/inertia";

const Sidebar: React.FC = () => {
    const {
        auth: { check: isUserLoggedIn, is_admin: isUserAdmin },
        capabilities: userCapabilities,
        gui: { resources: resourceLinks, tools: toolLinks },
    } = usePage<Page<CommonPageProps>>().props;
    const [collapseOpen, setCollapseOpen] = useState(true);

    const renderLink = (link: GuiLink) => {
        if (link.resourceName && link.resourcePermission) {
            if (!userCapabilities[link.resourceName][link.resourcePermission]) {
                return null;
            }
        }
        return (
            <NavItem key={link.key}>
                <NavLink
                    href={route(link.route)}
                    tag={InertiaLink}
                    onClick={closeCollapse}
                >
                    <i
                        className={`fas ${
                            link.icon ?? "fa-toolbox text-primary"
                        }`}
                    />
                    {link.title}
                </NavLink>
            </NavItem>
        );
    };
    // verifies if routeName is the one active (in browser input)
    // const activeRoute = (routeName) => {
    //     return props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
    // };
    const toggleCollapse = () => {
        setCollapseOpen((data) => !data);
    };
    const closeCollapse = () => {
        setCollapseOpen(false);
    };
    // creates the links that appear in the left menu / Sidebar
    // const createLinks = (routes) => {
    //     return routes.map((prop, key) => {
    //         return (
    //         );
    //     });
    // };

    return (
        <Navbar
            className="navbar-vertical fixed-left navbar-light bg-white"
            expand="md"
            id="sidenav-main"
        >
            <Container fluid>
                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleCollapse}
                >
                    <span className="navbar-toggler-icon" />
                </button>
                {/* Brand */}
                <NavbarBrand
                    className="pt-0"
                    tag={InertiaLink}
                    href={route("wiki.index")}
                >
                    {/*<img*/}
                    {/*    alt={logo.imgAlt}*/}
                    {/*    className="navbar-brand-img"*/}
                    {/*    src={logo.imgSrc}*/}
                    {/*/>*/}
                    SciKi
                </NavbarBrand>
                {/* User */}
                <Nav className="align-items-center d-md-none">
                    <UserDropdown />
                </Nav>
                {/* Collapse */}
                <Collapse navbar isOpen={collapseOpen}>
                    {/* Collapse header */}
                    <div className="navbar-collapse-header d-md-none">
                        <Row>
                            <Col className="collapse-brand" xs="6">
                                <InertiaLink href={route("wiki.index")}>
                                    SciKi
                                </InertiaLink>
                            </Col>
                            <Col className="collapse-close" xs="6">
                                <button
                                    className="navbar-toggler"
                                    type="button"
                                    onClick={toggleCollapse}
                                >
                                    <span />
                                    <span />
                                </button>
                            </Col>
                        </Row>
                    </div>
                    {/* Form */}
                    <Search sidebar />
                    {/* Navigation */}
                    <Nav navbar>
                        <NavItem>
                            <NavLink
                                href={route("wiki.index")}
                                tag={InertiaLink}
                                onClick={closeCollapse}
                            >
                                <i className="fas fa-home text-primary" />
                                Main Page
                            </NavLink>
                        </NavItem>
                        {/*<NavItem>*/}
                        {/*    <NavLink*/}
                        {/*        href={route("wiki.index")}*/}
                        {/*        tag={InertiaLink}*/}
                        {/*        onClick={closeCollapse}*/}
                        {/*    >*/}
                        {/*        <i className="fas fa-info text-green" />*/}
                        {/*        About SciKi*/}
                        {/*    </NavLink>*/}
                        {/*</NavItem>*/}
                        <NavItem>
                            <NavLink
                                href={route("static.contacts")}
                                tag={InertiaLink}
                                onClick={closeCollapse}
                            >
                                <i className="fas fa-address-card text-orange" />
                                Contacts
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <>
                        {/* Tools */}
                        <hr className="my-3" />
                        <h6 className="navbar-heading text-muted">Resources</h6>
                        <Nav navbar>
                            {resourceLinks.map(renderLink)}
                            {isUserAdmin && (
                                <NavItem>
                                    <NavLink
                                        href={route("admin.users.index")}
                                        tag={InertiaLink}
                                        onClick={closeCollapse}
                                    >
                                        <i className="fas fa-users text-primary" />
                                        Users
                                    </NavLink>
                                </NavItem>
                            )}
                            {userCapabilities["pages"]["list"] && (
                                <NavItem>
                                    <NavLink
                                        href={route("page.index")}
                                        tag={InertiaLink}
                                        onClick={closeCollapse}
                                    >
                                        <i className="fas fa-file text-primary" />
                                        {isUserAdmin ? "Pages" : "My Pages"}
                                    </NavLink>
                                </NavItem>
                            )}
                        </Nav>
                    </>
                    {isUserLoggedIn && (
                        <>
                            {/* Tools */}
                            <hr className="my-3" />
                            <h6 className="navbar-heading text-muted">Tools</h6>
                            <Nav navbar>
                                {toolLinks.map(renderLink)}
                                {isUserAdmin && (
                                    <NavItem>
                                        <NavLink
                                            href={route("admin.users.create")}
                                            tag={InertiaLink}
                                            onClick={closeCollapse}
                                        >
                                            <i className="fas fa-user-plus text-green" />
                                            New user
                                        </NavLink>
                                    </NavItem>
                                )}
                            </Nav>
                        </>
                    )}
                </Collapse>
            </Container>
        </Navbar>
    );
};

export default Sidebar;

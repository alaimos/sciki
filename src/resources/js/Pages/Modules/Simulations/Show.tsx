/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Header from "../../../Components/Layout/Headers/DefaultHeader";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Nav,
    NavItem,
    NavLink,
    Row,
} from "reactstrap";
import type { CommonPageProps } from "../../../Types/page";
import PathwaysTableEditor from "../../../Components/Modules/Simulations/PathwaysTableEditor";
import classNames from "classnames";
import NodesTableEditor from "../../../Components/Modules/Simulations/NodesTableEditor";
import PathwayImageEditor from "../../../Components/Modules/Simulations/PathwayImageEditor";

interface Props extends CommonPageProps {
    simulation: {
        id: number;
        name: string;
    };
    pathwaysToNames: Record<string, string>;
    nodesToNames: Record<string, string>;
}

const Index: React.FC<Props> = ({
    simulation,
    capabilities: {
        pages: { update: canEditPages },
    },
    pathwaysToNames,
    nodesToNames,
}: Props) => {
    const [selectedNav, setSelectedNav] = useState<number>(1);
    const [currentPathway, setCurrentPathway] = useState<string | undefined>();
    const changeSelectedNav =
        (selection: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setSelectedNav(selection);
        };
    console.log(simulation, pathwaysToNames, nodesToNames, canEditPages);
    return (
        <>
            <Header title={simulation.name} />
            <Container className="mt--7" fluid>
                <Row className="mb-2">
                    <Col>
                        <Nav
                            className="nav-fill flex-column flex-sm-row"
                            pills
                            role="tablist"
                        >
                            <NavItem>
                                <NavLink
                                    aria-selected={selectedNav === 1}
                                    className={classNames("mb-sm-3 mb-md-0", {
                                        active: selectedNav === 1,
                                    })}
                                    onClick={changeSelectedNav(1)}
                                    href="#"
                                    role="tab"
                                >
                                    Pathways Table
                                </NavLink>
                            </NavItem>
                            {currentPathway && (
                                <NavItem>
                                    <NavLink
                                        aria-selected={selectedNav === 2}
                                        className={classNames(
                                            "mb-sm-3 mb-md-0",
                                            {
                                                active: selectedNav === 2,
                                            }
                                        )}
                                        onClick={changeSelectedNav(2)}
                                        href="#"
                                        role="tab"
                                    >
                                        Nodes Table
                                    </NavLink>
                                </NavItem>
                            )}
                            <NavItem>
                                <NavLink
                                    aria-selected={selectedNav === 3}
                                    className={classNames("mb-sm-3 mb-md-0", {
                                        active: selectedNav === 3,
                                    })}
                                    onClick={changeSelectedNav(3)}
                                    href="#"
                                    role="tab"
                                >
                                    Heatmaps &amp; Graphs
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                {selectedNav === 1 && (
                    <Card className="shadow">
                        <CardBody>
                            <PathwaysTableEditor
                                simulation={simulation.id}
                                canEditPages={canEditPages}
                                pathwaysToNames={pathwaysToNames}
                                onView={(pathway) => {
                                    setCurrentPathway(pathway);
                                    setSelectedNav(2);
                                }}
                            />
                        </CardBody>
                    </Card>
                )}
                {selectedNav === 2 && (
                    <>
                        <Card className="shadow mb-2">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase ls-1 mb-1">
                                    Pathway Image
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <PathwayImageEditor
                                    simulation={simulation.id}
                                    pathway={currentPathway}
                                    canEditPages={canEditPages}
                                    pathwaysToNames={pathwaysToNames}
                                />
                            </CardBody>
                        </Card>
                        <Card className="shadow">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase ls-1 mb-1">
                                    Details
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <NodesTableEditor
                                    simulation={simulation.id}
                                    pathway={currentPathway}
                                    canEditPages={canEditPages}
                                    nodesToNames={nodesToNames}
                                />
                            </CardBody>
                        </Card>
                    </>
                )}
                {selectedNav === 3 && (
                    <Card className="shadow">
                        <CardHeader className="bg-transparent">
                            <h6 className="text-uppercase ls-1 mb-1">
                                Get the code
                            </h6>
                        </CardHeader>
                        <CardBody>TODO</CardBody>
                    </Card>
                )}
            </Container>
        </>
    );
};

export default Index;

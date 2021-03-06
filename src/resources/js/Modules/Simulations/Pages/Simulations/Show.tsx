/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { get } from "lodash";
import Header from "../../../../Components/Layout/Headers/DefaultHeader";
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
import type { CommonPageProps } from "../../../../Types/page";
import PathwaysTableEditor from "../../Components/PathwaysTableEditor";
import classNames from "classnames";
import NodesTableEditor from "../../Components/NodesTableEditor";
import PathwayImageEditor from "../../Components/PathwayImageEditor";
import SimulationHeatmapEditor from "../../Components/SimulationHeatmapEditor";
import CorrelationGraphEditor from "../../Components/CorrelationGraphEditor";
import PartialCorrelationGraphEditor from "../../Components/PartialCorrelationGraphEditor";

interface Props extends CommonPageProps {
    simulation: {
        id: number;
        name: string;
    };
    pathwaysToNames: Record<string, string>;
    nodesToNames: Record<string, string>;
}

type SelectedNodesType = Record<string, string[]>;

const Index: React.FC<Props> = ({
    simulation,
    capabilities: {
        pages: { update: canEditPages },
    },
    pathwaysToNames,
}: Props) => {
    const [selectedNav, setSelectedNav] = useState<number>(1);
    const [currentPathway, setCurrentPathway] = useState<string | undefined>();
    const [selectedPathways, setSelectedPathways] = useState<string[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<SelectedNodesType>({});
    const [correlationGraphId, setCorrelationGraphId] = useState<string>();
    const changeSelectedNav =
        (selection: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            setSelectedNav(selection);
        };
    const onSelectPathway = canEditPages
        ? (pathway: string) => {
              setSelectedPathways((prevState) => {
                  if (prevState.includes(pathway)) {
                      return prevState.filter((v) => v !== pathway);
                  } else {
                      return [...prevState, pathway];
                  }
              });
          }
        : undefined;
    const onSelectNode = canEditPages
        ? (node: string, pathway: string) => {
              setSelectedNodes((prevState) => {
                  const prevSelection: string[] = get(prevState, pathway, []);
                  if (prevSelection.includes(node)) {
                      return {
                          ...prevState,
                          [pathway]: prevSelection.filter((v) => v !== node),
                      };
                  } else {
                      return {
                          ...prevState,
                          [pathway]: [...prevSelection, node],
                      };
                  }
              });
          }
        : undefined;

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
                                    Heatmaps
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    aria-selected={selectedNav === 4}
                                    className={classNames("mb-sm-3 mb-md-0", {
                                        active: selectedNav === 4,
                                    })}
                                    onClick={changeSelectedNav(4)}
                                    href="#"
                                    role="tab"
                                >
                                    Correlation
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
                                onView={(pathway) => {
                                    setCurrentPathway(pathway);
                                    setSelectedNav(2);
                                }}
                                onSelect={onSelectPathway}
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
                                    onSelect={onSelectNode}
                                />
                            </CardBody>
                        </Card>
                    </>
                )}
                {selectedNav === 3 && (
                    <Card className="shadow">
                        <CardHeader className="bg-transparent">
                            <h6 className="text-uppercase ls-1 mb-1">
                                Pathway/Nodes heatmap
                            </h6>
                        </CardHeader>
                        <CardBody>
                            <SimulationHeatmapEditor
                                simulation={simulation.id}
                                canEditPages={canEditPages}
                                selectedPathways={selectedPathways}
                                selectedNodes={selectedNodes}
                            />
                        </CardBody>
                    </Card>
                )}
                {selectedNav === 4 && (
                    <>
                        <Card className="shadow">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase ls-1 mb-1">
                                    Correlation graph
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <CorrelationGraphEditor
                                    simulation={simulation.id}
                                    canEditPages={canEditPages}
                                    onIdChange={setCorrelationGraphId}
                                />
                            </CardBody>
                        </Card>
                        <Card className="shadow">
                            <CardHeader className="bg-transparent">
                                <h6 className="text-uppercase ls-1 mb-1">
                                    Correlation details
                                </h6>
                            </CardHeader>
                            <CardBody>
                                <PartialCorrelationGraphEditor
                                    simulation={simulation.id}
                                    canEditPages={canEditPages}
                                    correlationGraphId={correlationGraphId}
                                />
                            </CardBody>
                        </Card>
                    </>
                )}
            </Container>
        </>
    );
};

export default Index;

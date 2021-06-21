import React from "react";
import Header from "../../Components/Layout/Headers/DefaultHeader";
import { Card, CardBody, Container } from "reactstrap";
import { CommonPageProps } from "../../Types/page";

interface Props extends CommonPageProps {
    id: number;
    uuid: string;
    title: string;
    legend: string;
    url: string;
    thumbs: {
        small: string;
        large: string;
    };
    srcset: string;
}

const Media: React.FC<Props> = (props: Props) => {
    return (
        <>
            <Header title={props.title} />
            <Container className="mt--7" fluid>
                <Card className="shadow mb-2 bg-gradient-dark">
                    <CardBody className="text-sm text-light">
                        {props.legend}
                    </CardBody>
                </Card>
                <Card className="shadow">
                    <CardBody>
                        <img
                            srcSet={props.srcset}
                            src={props.url}
                            alt={props.title}
                            className="img-fluid"
                        />
                    </CardBody>
                </Card>
            </Container>
        </>
    );
};

export default Media;

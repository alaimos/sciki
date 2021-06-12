import React from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row,
} from "reactstrap";
import { CommonPageProps } from "../../../Types/page";
import HeaderWithImage from "../../../Components/Layout/Headers/HeaderWithImage";
import classNames from "classnames";
import { useForm } from "@inertiajs/inertia-react";
// import {InertiaLink} from "@inertiajs/inertia-react";
// import {Helmet} from "react-helmet";
// import route from "ziggy-js";

type Props = CommonPageProps;

interface ProfileFormType {
    name: string;
    email: string;
}

const Index: React.FC<Props> = ({ auth: { user } }: Props) => {
    const {
        data: profileData,
        setData: setProfileData,
        errors: profileErrors,
        processing: profileProcessing,
    } =
        // @ts-ignore
        useForm<ProfileFormType>("UpdateProfileForm", {
            name: user?.name ?? "",
            email: user?.email ?? "",
        });

    return (
        <>
            {user && (
                <>
                    <HeaderWithImage
                        title={`Hello ${user.name}`}
                        bgUrl={user.avatar.large}
                    />
                    <Container className="mt--7" fluid>
                        <Row>
                            <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
                                <Card className="card-profile shadow">
                                    <Row className="justify-content-center">
                                        <Col className="order-lg-2" lg="3">
                                            <div className="card-profile-image">
                                                <img
                                                    alt={user.name}
                                                    className="rounded-circle"
                                                    src={user.avatar.medium}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                                        <div className="d-flex justify-content-between">
                                            &nbsp;
                                        </div>
                                    </CardHeader>
                                    <CardBody className="pt-0 pt-md-4">
                                        <div className="text-center mt-md-5">
                                            <h3>{user.name}</h3>
                                            {/*<div className="h5 font-weight-300">*/}
                                            {/*    <i className="ni location_pin mr-2" />*/}
                                            {/*    Bucharest, Romania*/}
                                            {/*</div>*/}
                                            {/*<div className="h5 mt-4">*/}
                                            {/*    <i className="ni business_briefcase-24 mr-2" />*/}
                                            {/*    Solution Manager - Creative Tim*/}
                                            {/*    Officer*/}
                                            {/*</div>*/}
                                            {/*<div>*/}
                                            {/*    <i className="ni education_hat mr-2" />*/}
                                            {/*    University of Computer Science*/}
                                            {/*</div>*/}
                                            {/*<hr className="my-4" />*/}
                                            {/*<p>*/}
                                            {/*    Ryan — the name taken by*/}
                                            {/*    Melbourne-raised, Brooklyn-based*/}
                                            {/*    Nick Murphy — writes, performs*/}
                                            {/*    and records all of his own*/}
                                            {/*    music.*/}
                                            {/*</p>*/}
                                        </div>
                                        <Row>
                                            <div className="col">
                                                <div className="card-profile-stats d-flex justify-content-center">
                                                    <div>
                                                        <span className="heading">
                                                            22
                                                        </span>
                                                        <span className="description">
                                                            Friends
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="heading">
                                                            10
                                                        </span>
                                                        <span className="description">
                                                            Photos
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="heading">
                                                            89
                                                        </span>
                                                        <span className="description">
                                                            Comments
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col className="order-xl-1" xl="8">
                                <Card className="bg-secondary shadow">
                                    <CardHeader className="bg-white border-0">
                                        <h3 className="mb-0">Your profile</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <h6 className="heading-small text-muted mb-4">
                                            User information
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col lg="12">
                                                    <Form>
                                                        <FormGroup
                                                            className={classNames(
                                                                {
                                                                    "has-danger":
                                                                        !!profileErrors.name,
                                                                }
                                                            )}
                                                        >
                                                            <Label
                                                                className="form-control-label"
                                                                for="create-simulation-name"
                                                            >
                                                                Name
                                                            </Label>
                                                            <Input
                                                                id="create-simulation-name"
                                                                placeholder="Name"
                                                                type="text"
                                                                value={
                                                                    profileData.name
                                                                }
                                                                invalid={
                                                                    !!profileErrors.name
                                                                }
                                                                onChange={(e) =>
                                                                    setProfileData(
                                                                        "name",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            <FormFeedback
                                                                tag="span"
                                                                className="invalid-feedback"
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                <strong>
                                                                    {
                                                                        profileErrors.name
                                                                    }
                                                                </strong>
                                                            </FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup
                                                            className={classNames(
                                                                {
                                                                    "has-danger":
                                                                        !!profileErrors.email,
                                                                }
                                                            )}
                                                        >
                                                            <Label
                                                                className="form-control-label"
                                                                for="create-simulation-email"
                                                            >
                                                                E-mail
                                                            </Label>
                                                            <Input
                                                                id="create-simulation-email"
                                                                placeholder="Email"
                                                                type="email"
                                                                autoComplete="new-email"
                                                                value={
                                                                    profileData.email
                                                                }
                                                                invalid={
                                                                    !!profileErrors.email
                                                                }
                                                                onChange={(e) =>
                                                                    setProfileData(
                                                                        "email",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            <FormFeedback
                                                                tag="span"
                                                                className="invalid-feedback"
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                <strong>
                                                                    {
                                                                        profileErrors.email
                                                                    }
                                                                </strong>
                                                            </FormFeedback>
                                                        </FormGroup>
                                                    </Form>
                                                </Col>
                                            </Row>
                                            <div className="d-flex justify-content-center">
                                                <Button
                                                    color="primary"
                                                    href="#pablo"
                                                    onClick={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    size="sm"
                                                    disabled={profileProcessing}
                                                >
                                                    <i className="fas fa-save mr-2" />
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="heading-small text-muted mb-4">
                                            Change your password
                                        </h6>
                                        <div className="pl-lg-4">
                                            <Row>
                                                <Col md="12">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-address"
                                                        >
                                                            Address
                                                        </label>
                                                        <Input
                                                            className="form-control-alternative"
                                                            defaultValue="Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09"
                                                            id="input-address"
                                                            placeholder="Home Address"
                                                            type="text"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-city"
                                                        >
                                                            City
                                                        </label>
                                                        <Input
                                                            className="form-control-alternative"
                                                            defaultValue="New York"
                                                            id="input-city"
                                                            placeholder="City"
                                                            type="text"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-country"
                                                        >
                                                            Country
                                                        </label>
                                                        <Input
                                                            className="form-control-alternative"
                                                            defaultValue="United States"
                                                            id="input-country"
                                                            placeholder="Country"
                                                            type="text"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-country"
                                                        >
                                                            Postal code
                                                        </label>
                                                        <Input
                                                            className="form-control-alternative"
                                                            id="input-postal-code"
                                                            placeholder="Postal code"
                                                            type="number"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </>
            )}
        </>
    );
};

export default Index;

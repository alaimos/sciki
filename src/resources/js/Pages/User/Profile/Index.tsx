import React from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Form,
    Row,
} from "reactstrap";
import { CommonPageProps } from "../../../Types/page";
import HeaderWithImage from "../../../Components/Layout/Headers/HeaderWithImage";
import { useForm } from "@inertiajs/inertia-react";
import InputWithLabel from "../../../Components/Common/Forms/InputWithLabel";
import route from "ziggy-js";
// import {InertiaLink} from "@inertiajs/inertia-react";
// import {Helmet} from "react-helmet";
// import route from "ziggy-js";

interface Props extends CommonPageProps {
    published: number;
    drafts: number;
    comments: number;
}

interface ProfileFormType {
    name: string;
    email: string;
}

interface ChangePasswordFormType {
    current_password: string;
    password: string;
    password_confirmation: string;
}

const Index: React.FC<Props> = ({
    auth: { user },
    published,
    drafts,
    comments,
}: Props) => {
    const {
        data: profileData,
        setData: setProfileData,
        errors: profileErrors,
        processing: profileProcessing,
        patch: profilePatch,
    } =
        // @ts-ignore
        useForm<ProfileFormType>("UpdateProfileForm", {
            name: user?.name ?? "",
            email: user?.email ?? "",
        });

    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        processing: passwordProcessing,
        patch: passwordPatch,
    } =
        // @ts-ignore
        useForm<ChangePasswordFormType>("ChangePasswordForm", {
            current_password: "",
            password: "",
            password_confirmation: "",
        });

    const submitChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        return passwordPatch(route("profile.password.update"));
    };

    const submitUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        return profilePatch(route("profile.update"));
    };

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
                                                            {published}
                                                        </span>
                                                        <span className="description">
                                                            Pages
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="heading">
                                                            {drafts}
                                                        </span>
                                                        <span className="description">
                                                            Drafts
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="heading">
                                                            {comments}
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
                                        <Form onSubmit={submitUpdateProfile}>
                                            <div className="pl-lg-4">
                                                <Row>
                                                    <Col lg="12">
                                                        <InputWithLabel
                                                            name="name"
                                                            label="Name"
                                                            type="text"
                                                            value={
                                                                profileData.name
                                                            }
                                                            error={
                                                                profileErrors.name
                                                            }
                                                            setValue={
                                                                setProfileData
                                                            }
                                                        />
                                                        <InputWithLabel
                                                            name="email"
                                                            label="E-mail"
                                                            type="email"
                                                            value={
                                                                profileData.email
                                                            }
                                                            error={
                                                                profileErrors.email
                                                            }
                                                            setValue={
                                                                setProfileData
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                                <div className="d-flex justify-content-center">
                                                    <Button
                                                        type="submit"
                                                        color="primary"
                                                        size="sm"
                                                        disabled={
                                                            profileProcessing
                                                        }
                                                    >
                                                        <i className="fas fa-save mr-2" />
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        </Form>
                                        <hr className="my-4" />
                                        <h6 className="heading-small text-muted mb-4">
                                            Change your password
                                        </h6>
                                        <Form onSubmit={submitChangePassword}>
                                            <div className="pl-lg-4">
                                                <Row>
                                                    <Col md="12">
                                                        <InputWithLabel
                                                            name="current_password"
                                                            label="Current Password"
                                                            type="password"
                                                            value={
                                                                passwordData.current_password
                                                            }
                                                            error={
                                                                passwordErrors.current_password
                                                            }
                                                            setValue={
                                                                setPasswordData
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md="6">
                                                        <InputWithLabel
                                                            name="password"
                                                            label="New Password"
                                                            type="password"
                                                            value={
                                                                passwordData.password
                                                            }
                                                            error={
                                                                passwordErrors.password
                                                            }
                                                            setValue={
                                                                setPasswordData
                                                            }
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <InputWithLabel
                                                            name="password_confirmation"
                                                            label="Confirm password"
                                                            type="password"
                                                            value={
                                                                passwordData.password_confirmation
                                                            }
                                                            error={
                                                                passwordErrors.password_confirmation
                                                            }
                                                            setValue={
                                                                setPasswordData
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                                <div className="d-flex justify-content-center">
                                                    <Button
                                                        type="submit"
                                                        color="primary"
                                                        size="sm"
                                                        disabled={
                                                            passwordProcessing
                                                        }
                                                    >
                                                        <i className="fas fa-key mr-2" />
                                                        Change password
                                                    </Button>
                                                </div>
                                            </div>
                                        </Form>
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

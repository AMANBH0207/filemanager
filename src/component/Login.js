import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import '../styles/Login.css'; // Ensure you have a CSS file for login similar to your signup page
import { useAuth } from './Context/AuthContext'; // Import the useAuth hook
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth(); // Access signIn method from AuthContext
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        const { email, password } = formData;

        try {
            await signIn(email, password); 
            console.log("User signed in");
            navigate("/filemanager");
        } catch (error) {
            console.error("Error signing in:", error.message);
        }

    };

    return (
        <Container fluid className="px-3">
            <Row className="min-vh-100">
                <Col md={8} lg={6} xl={5} className="mx-auto my-auto border border-gray rounded p-5">
                    <div className="text-center mb-4">
                        <h2>Welcome Back</h2>
                    </div>
                    <Form onSubmit={handleSubmit} className="mb-3 p-4">
                        <Form.Group controlId="formBasicEmail" className='p-2'>
                            <Form.Control type="email" placeholder="Email" name="email" onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="formBasicPassword" className='p-2'>
                            <Form.Control type="password" placeholder="Password" name="password" onChange={handleChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-50 mt-5">
                            Log in
                        </Button>
                    </Form>
                    <div className="text-center mb-3">
                    <p className="text-muted">Not a member yet?</p>
                    <a href="/">Sign up</a>
                    </div>
                    {/* <Button variant="outline-primary" className="mb-2 w-100">
                        <FontAwesomeIcon icon={faFacebookF} className="me-2" /> Login with Facebook
                    </Button>
                    <Button variant="outline-danger" className="w-100">
                        <FontAwesomeIcon icon={faGoogle} className="me-2" /> Login with Google
                    </Button> */}
                </Col>
            </Row>
        </Container>
    );
}

export default Login;

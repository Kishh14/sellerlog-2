import { useState } from 'react';
import { account } from '../appwrite/appwrite-config';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({
  handleSignupModalShow,
  showLoginModal,
  handleLoginModalClose,
}) => {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const loginUser = async (e) => {
    e.preventDefault();

    const promise = account.createEmailPasswordSession(
      user.email,
      user.password
    );

    toast
      .promise(promise, {
        pending: 'Login You In...',
        success: 'Logged In Successfully! 👌',
        error: 'Error Occured While Login In 🤯',
      })
      .then(
        function (response) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        function (error) {
          console.log(error);
          const errorNotify = () => toast.error(`${error}`);
          errorNotify();
        }
      );
  };

  return (
    <>
      <Modal
        show={showLoginModal}
        onHide={handleLoginModalClose}
        backdrop="static"
        keyboard={false}
        className="signup-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="my-3">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              onChange={(e) => {
                setUser({ ...user, email: e.target.value });
              }}
              className="form-control w-75 m-auto p-2 mb-3"
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              onChange={(e) => {
                setUser({ ...user, password: e.target.value });
              }}
              className="form-control w-75 m-auto p-2 mb-3"
            />
            <button
              type="submit"
              className="btn btn-primary m-auto d-block w-75"
              onClick={loginUser}
            >
              Login
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => {
              handleLoginModalClose();
              handleSignupModalShow();
            }}
            className="btn btn-dark m-auto d-block w-75 my-3"
          >
            Don't have an account? Signup
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;

import { useState } from 'react';
import { account } from '../appwrite/appwrite-config';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = ({
  showSignupModal,
  handleSingupModalClose,
  handleLoginModalShow,
}) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
  });

  const signupUser = async (e) => {
    e.preventDefault();

    const promise = account.create(
      uuidv4(),
      user.email,
      user.password,
      user.name
    );
    toast
      .promise(promise, {
        pending: 'Signing you up...',
        success: 'Account Created! 👌',
        error: 'Error Creating Account 🤯',
      })
      .then(
        function (response) {
          handleSingupModalClose();
          handleLoginModalShow();
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
        show={showSignupModal}
        onHide={handleSingupModalClose}
        backdrop="static"
        keyboard={false}
        className="signup-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Signup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="my-3">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              required
              onChange={(e) => {
                setUser({ ...user, name: e.target.value });
              }}
              className="form-control w-75 m-auto p-2 mb-3"
            />
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
              placeholder="Create new password"
              required
              onChange={(e) => {
                setUser({ ...user, password: e.target.value });
              }}
              className="form-control w-75 m-auto p-2 mb-3"
            />
            <button
              className="btn btn-primary m-auto d-block w-75"
              type="submit"
              onClick={signupUser}
            >
              Sign up
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => {
              handleSingupModalClose();
              handleLoginModalShow();
            }}
            className="btn btn-dark m-auto d-block w-75 my-3"
          >
            Already have an account? Login
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Signup;

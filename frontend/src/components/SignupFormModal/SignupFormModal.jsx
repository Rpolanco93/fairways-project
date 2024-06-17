import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true)
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  useEffect(() => {
    setIsDisabled(
      email.length < 1 ||
      password.length < 6 ||
      username.length < 4 ||
      firstName.length < 1 ||
      lastName.length < 1 ||
      confirmPassword.length < 6
    )
  }, [email, username, firstName, lastName, password, confirmPassword])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  return (
    <div className='signup-modal'>
      <h1 className='signup-header'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='signup-form'>
        <label className='signup-form-labels'>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='signup-inputs'
          />
        </label>
        {errors.email && <p className='signup-error'>{errors.email}</p>}
        <label className='signup-form-labels'>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className='signup-inputs'
          />
        </label>
        {errors.username && <p className='signup-error'>{errors.username}</p>}
        <label className='signup-form-labels'>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className='signup-inputs'
          />
        </label>
        {errors.firstName && <p className='signup-error'>{errors.firstName}</p>}
        <label className='signup-form-labels'>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className='signup-inputs'
          />
        </label>
        {errors.lastName && <p className='signup-error'>{errors.lastName}</p>}
        <label className='signup-form-labels'>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='signup-inputs'
          />
        </label>
        {errors.password && <p className='signup-error'>{errors.password}</p>}
        <label className='signup-form-labels'>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='signup-inputs'
          />
        </label>
        {errors.confirmPassword && (
          <p className='signup-error'>{errors.confirmPassword}</p>
        )}
        <button type="submit" disabled={isDisabled} className='signup-button'>Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;

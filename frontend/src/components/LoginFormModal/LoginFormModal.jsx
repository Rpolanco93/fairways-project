import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css'

const LoginFormModal = () => {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [isDisabled, setIsDisabled] = useState(true)
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    useEffect(() => {
      setIsDisabled(credential.length < 4 || password.length < 6)
    }, [credential, password])

    const handleSubmit = (e) => {
      e.preventDefault();
      setErrors({});
      return dispatch(sessionActions.login({ credential, password }))
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) setErrors(data.errors);
          if (data && data.message) setErrors(data.message);
        });
    };

    return (
      <div className='login-modal'>
        <div className='login-title-div'>
          <h1 className='login-title'>Log In</h1>
          {Object.values(errors).length > 0 && (
          <p className='login-error'>The provided credentials were invalid</p>
          )}
        </div>
      <form onSubmit={handleSubmit} className='login-form'>
        <label className='login-form-labels'>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            className='login-inputs'
          />
        </label>
        <label className='login-form-labels'>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='login-inputs'
          />
        </label>
        <button type="submit" disabled={isDisabled} className='login-submit'>Log In</button>
      </form>
    </div>
  );
}

export default LoginFormModal;

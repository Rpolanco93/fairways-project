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
      // if (Object.values(errors)) setErrors({})

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
      <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {Object.values(errors).length > 0 && (
          <p>The provided credentials were invalid</p>
        )}
        <button type="submit" disabled={isDisabled}>Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;

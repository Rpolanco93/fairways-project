import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileButton from './ProfileButton';
import Logo from './fairways-logo.jpg'
import './Navigation.css';
import { useEffect, useState } from 'react';

function Navigation({ isLoaded }) {
  const dispatch = useDispatch()
  const sessionUser = useSelector((state) => state.session.user);
  const navigate = useNavigate()


  return (
    <header className='nav-container'>
      <Link to='/'><img src={Logo} alt='logo' className='logo'></img></Link>
      <ul id='nav'>
        {isLoaded && (
          <nav className='session'>
            <li className='create-spot'>
              {sessionUser ? (<button onClick={() => navigate('/spots/new')}>Create Spot</button>) : ("")}
            </li>
            <ProfileButton user={sessionUser} className='pbutton' />
          </nav>
          )}
      </ul>
    </header>
  );
}

export default Navigation;

// (<Link to='/spots/new'>Create a New Spot</Link>)

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import LandingPage from './components/LandingPage/LandingPage';
import { CreateSpot, EditSpot, ManageSpots, SpotDetails } from './components/SpotComponents';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/spots/:id/edit',
        element: <EditSpot />
      },
      {
        path: '/spots/:id',
        element: <SpotDetails />
      },
      {
        path: '/spots/new',
        element: <CreateSpot />
      },
      {
        path: '/spots/current',
        element: <ManageSpots />
      },
      {
        path: '*',
        element: <h1>Page Not Found</h1>
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App;

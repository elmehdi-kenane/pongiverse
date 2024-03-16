// import { useState } from 'react'
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LandingPage from './components/landing_page/LandingPage.jsx';
import ErrorPage from './components/ErrorPage/ErrorPage.jsx';

const router = createBrowserRouter([
	{
	  path: '/',
	  element: <LandingPage></LandingPage>,
	  errorElement: <ErrorPage></ErrorPage>
	}
  ]);
  

function App() {
	return <RouterProvider router={router} />
}

export default App

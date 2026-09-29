import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './components/common/RootLayout.jsx';
import Home from './components/common/Home.jsx';
import Login from './components/common/Login.jsx'
import Signup from './components/common/Signup.jsx'
import AboutUs from './components/common/AboutUs.jsx'
import ContactUs from './components/common/ContactUs.jsx'
import ResumeCreate from './components/resume/ResumeCreate.jsx'
import ResumeReview from './components/resume/ResumeReview.jsx'
import ResumeUpload from './components/resume/ResumeUpload.jsx'
import ResumeView from './components/resume/ResumeView.jsx'

const browserRouterObj = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'signin',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'aboutus',
        element: <AboutUs />,
      },
      {
        path: 'contactus',
        element: <ContactUs />,
      },
      {
        path: 'resume/resumecreate',
        element: <ResumeCreate />,
      },
      {
        path: 'resume/resumereview',
        element: <ResumeReview />,
      },
      {
        path: 'resume/resumeupload',
        element: <ResumeUpload />,
      },
      {
        path: 'resume/resumeview',
        element: <ResumeView />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={browserRouterObj} future={{
        v7_startTransition: true,
      }} />
  </StrictMode>
);
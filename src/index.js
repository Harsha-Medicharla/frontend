import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import "./index.css"
import { 
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App';
import ContestForm from './Contests/Contestdetails';
import ContestProblemPage from './pages/contestproblems/[pid]';
import AuthPage from './pages/auth/AuthPage';
import ProblemPage from './pages/problems/[pid]';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ContestDetailsPage from './Contests/Contestmain';
import ChallengesPage from './Contests/challengelist';
import Learn from './components/three/grid';
import Select from './Contests/contestselection';
import Hostmain from './Contests/Hostmainpage';
import Questions from './Contests/Questions';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />,
  },
  {
    path: "/problems",
    element: <App />,
  },
  {
    path: "/questions/:id",
    element: <Questions />,
  },
  {
    path: "/hostcontests/:id",
    element: <Questions />,
  },
  {
    path: "/hostcontests",
    element: <Hostmain />,
  },
  {
    path: "/contests/challenges",
    element: <ChallengesPage />,
  },
  {
    path: "/contests",
    element: <ContestForm/>,
  },
  {
    path: "/learn",
    element: <Learn />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/contests/:contestId",
    element: <Select/>
  },
  {
    path: "/contestproblems/:pid",
    element: <ContestProblemPage />,
  },
  {
    path: "/problems/:pid",
    element: <ProblemPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
    <ToastContainer/>
  </RecoilRoot>
);

reportWebVitals();
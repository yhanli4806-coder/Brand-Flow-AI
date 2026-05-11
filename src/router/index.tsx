import { createBrowserRouter } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import Workspace from '../pages/workspace/workspace';
import Home from '../pages/home/home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />, // 父布局
    children: [
      { path: 'home', element: <Home /> },
      { path: 'workspace', element: <Workspace /> },
    ],
  },
]);
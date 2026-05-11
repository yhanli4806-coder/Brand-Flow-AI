import React from 'react';
import { Outlet } from 'react-router-dom';

const BasicLayout: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};
export default BasicLayout;
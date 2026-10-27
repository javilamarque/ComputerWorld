import React from 'react';
import {createRoot} from 'react-dom/client';
import Catalog from './catalog';
import './styles.css';
const admin=location.pathname.replace(/\/$/,'')==='/admin';
createRoot(document.getElementById('root')!).render(<Catalog admin={admin}/>);

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'
import { store } from 'store'

const storedDark = localStorage.getItem('cl_darkMode');
if (storedDark === 'true') {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
)
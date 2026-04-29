import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store'
import { AuthBootstrap } from './components/AuthBootstrap'
import '@carbon/styles/css/styles.css'
import './styles/global.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)

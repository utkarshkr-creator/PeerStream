import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './components/Home'
import { EndCall } from './components/EndCall'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='endcall' element={<EndCall />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Main } from './pages/Main';
import { Details } from './pages/Details';
const App = () => {

  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="details/:id/:networkId" element={<Details />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;

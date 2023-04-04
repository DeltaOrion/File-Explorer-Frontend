import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import FileExplorerPage from './pages/FileExplorerPage';
import NoPage from './pages/NoPage';

function App() {

  //react router, we want to swap out the page depending on the link
  //page
  // -> files
  //    ->  path
  //

  return (
    <BrowserRouter>
      <div className='app'>
        {/** Top Navbar  */}
        <nav className='top-nav'>
          <h1 className='app-name'>My File System</h1>
        </nav>
        {/** Main Page - file explorer in this case */}
        <div className='page'>
          <Routes>
            <Route path="/explorer/*" element={<FileExplorerPage currPath='/explorer' />} />
            
            {/* Simply have one routing path for convenience now 
            <Route path="*" element={<NoPage />} />
            */}
          </Routes>
        </div >
      </div>
    </BrowserRouter>
  );
}

export default App;

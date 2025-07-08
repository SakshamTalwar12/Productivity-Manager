import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from "./components/Home.jsx";
import About from './components/About.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import ToDoList from './components/ToDoList.jsx';
import Analytics from './components/Analytics.jsx';
import Contact from './components/Contact.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todo" element={<ToDoList />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
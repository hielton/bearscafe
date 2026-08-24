import { Link } from "react-router-dom";
import bear from "../../assets/chefbear.png";

function Navbar() {
    return (
        <nav>
            <Link to="/" className="logo">
                <img src={bear} alt="Chef Bear" />
                <h2>BearsCafe</h2>
            </Link>
        
            <div>
                <Link to="/">Home</Link>
                <Link to="/meals">Meals</Link>
                <Link to="/login">Login</Link>
                <Link to="/staff">Staff Dashboard</Link>
                <Link to="/add-meals">Add meals</Link>
            </div>
    
        </nav>
    );
}

export default Navbar;

import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Village Rankings', path: '/rankings' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
  ];

  return (
    <nav style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container">
        <ul className="flex" style={{ margin: 0, padding: 0 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '14px 22px',
                    color: 'white',
                    fontWeight: isActive ? '700' : '500',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    borderBottom: isActive ? '3px solid white' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { if (!isActive) e.target.style.backgroundColor = 'transparent'; }}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

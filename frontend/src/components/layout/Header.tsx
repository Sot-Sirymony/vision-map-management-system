import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Vision Mapping</p>
        <h1>{user?.fullName ?? 'Workspace'}</h1>
      </div>
      <button className="button button-secondary" type="button" onClick={logout}>
        Logout
      </button>
    </header>
  );
}

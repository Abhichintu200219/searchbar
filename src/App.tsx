
import SearchBar from "./components/SearchBar";

export default function App() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://wallpapers.com/images/featured/digital-art-background-98hwar6swibxmlqv.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* overlay using inline style to avoid Tailwind-arbitrary issues */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />

      <div className="relative z-10 w-full px-4">
        <SearchBar />
      </div>
    </div>
  );
}

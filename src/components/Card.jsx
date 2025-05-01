export default function Card({ children, className }) {
    return (
      <div className={`bg-white shadow-md rounded-md ${className}`}>
        {children}
      </div>
    );
  }
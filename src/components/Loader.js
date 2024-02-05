'use client'
function Loader() {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center text-green-500 bg-black bg-opacity-80">
      <div className="text-center">
        <svg
          className="w-10 h-10 mx-auto mb-3 text-green-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Processing...
      </div>
    </div>
  );
}

export default Loader;

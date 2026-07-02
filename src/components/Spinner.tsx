export function Spinner({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`border-3 border-white/10 border-t-joyflix-red rounded-full animate-spin mx-auto ${
        small ? 'spinner-small' : 'w-10 h-10 my-16'
      }`}
    />
  );
}

export function Toast() {
  // imported via useApp in App
  return null;
}

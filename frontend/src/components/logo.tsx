export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/app-logo.png"
      alt="Twogether logo"
      style={{ width: size, height: "auto", display: "block" }}
    />
  );
}
import common from "@/locales/fr/common.json";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-16">
      <p>{common.home.placeholder}</p>
    </div>
  );
}

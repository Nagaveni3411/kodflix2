import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children, footerText, footerLinkText, footerLinkTo }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-netflixBlack text-white">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />
      </div>

      <header className="relative z-10 px-6 py-6 md:px-12">
        <h1 className="text-3xl font-extrabold tracking-wide text-netflixRed">KODFLIX</h1>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-110px)] w-full max-w-md items-center px-6 pb-10">
        <section className="w-full rounded-md bg-black/75 p-8 shadow-panel backdrop-blur-sm md:p-10">
          <h2 className="text-3xl font-bold">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-zinc-300">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
          <p className="mt-7 text-sm text-zinc-400">
            {footerText}{" "}
            <Link to={footerLinkTo} className="font-semibold text-white hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default AuthLayout;

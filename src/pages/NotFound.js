import { useNavigate } from "react-router-dom";


export default function NotFound() {
    const navigate = useNavigate();
    return (
        <>
            <main className="relative isolate min-h-screen">
                <img
                    src="/earring.jpeg"
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
                />
                <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
                    <p className="text-base font-semibold leading-8 text-white">404</p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Page not found</h1>
                    <p className="mt-4 text-base text-white/70 sm:mt-6">Sorry, we couldn’t find the page you’re looking for.</p>
                    <div className="mt-10 flex justify-center">
                        <a onClick={() => navigate('/categories')} className="text-sm font-semibold leading-7 text-white">
                            <span aria-hidden="true">&larr;</span> Back to products
                        </a>
                    </div>
                </div>
            </main>
        </>
    )
}

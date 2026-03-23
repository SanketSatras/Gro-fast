export function HomeBanner() {
    return (
        <div className="px-6 -mt-10 relative z-20">
            <div className="bg-white rounded-3xl p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative border border-slate-50 flex flex-col justify-center items-center min-h-[160px]">

                {/* Decorative background circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-50 rounded-full blur-2xl -z-10" />

                <div className="text-center z-10 relative">
                    <h2 className="text-2xl font-black text-slate-800 leading-[1.1] mb-2">
                        Fresh<br />
                        <span className="text-primary">Vegetables</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                        up to 30% off*
                    </p>
                </div>

                {/* Abstract floating vegetables / elements */}
                {/* Left Tomato */}
                <div className="absolute top-4 left-6 w-12 h-12">
                    <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop&bg=transparent" alt="Tomatoes" className="w-full h-full object-cover rounded-full shadow-lg" />
                </div>
                <div className="absolute bottom-6 left-12 w-14 h-14">
                    <img src="https://images.unsplash.com/photo-1596765792275-3004bbcd8a9a?w=100&h=100&fit=crop" alt="Pumpkin" className="w-full h-full object-cover rounded-full shadow-lg" />
                </div>

                {/* Right Pepper/Onion */}
                <div className="absolute top-6 right-8 w-10 h-10">
                    <img src="https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=100&h=100&fit=crop" alt="Peppers" className="w-full h-full object-cover rounded-full shadow-lg" />
                </div>
                <div className="absolute bottom-5 right-6 w-16 h-16">
                    <img src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=100&h=100&fit=crop" alt="Cabbage" className="w-full h-full object-cover rounded-full shadow-lg" />
                </div>
            </div>
        </div>
    );
}

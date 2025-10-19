import React from 'react';

const TreeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5m3-9-3 3-3-3m-1.5 6-3 3-3-3m1.5-6-3 3-3-3m12 12-3-3-3 3" />
    </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" />
    </svg>
);


const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-2">
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-100 dark:bg-purple-900/50">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);


const LandingPage: React.FC = () => {
    const handleLogin = () => {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.open();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 selection:bg-purple-300 selection:text-purple-900">
            {/* Hero Section */}
            <div 
                className="relative min-h-screen flex flex-col items-center justify-center text-center p-4 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://i.postimg.cc/DZBW1Cbf/Geni-cover.png')` }}
            >
                <div className="absolute inset-0 bg-black/60 dark:bg-black/70"></div>
                <main className="relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in-down">
                        გენეალოგიური ხე
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 mb-8 animate-fade-in-up">
                        აღმოაჩინეთ, შექმენით და ვიზუალურად გამოსახეთ თქვენი ოჯახის ისტორია. დაიწყეთ თქვენი საგვარეულო ხის აწყობა დღესვე.
                    </p>
                    <button
                        onClick={handleLogin}
                        className="px-8 py-3 rounded-full bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 animate-fade-in-up"
                    >
                        შესვლა / რეგისტრაცია
                    </button>
                </main>
            </div>
            
            {/* Features Section */}
            <section className="bg-white dark:bg-gray-900 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            რას გთავაზობთ?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            ყველაფერი, რაც თქვენი ოჯახის ისტორიის აღმოსაჩენად გჭირდებათ.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard 
                            icon={<TreeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                            title="ააწყვეთ თქვენი ხე"
                        >
                            მარტივად დაამატეთ ოჯახის წევრები, განსაზღვრეთ ურთიერთობები და შექმენით თქვენი დეტალური სანათესაო.
                        </FeatureCard>
                        <FeatureCard 
                            icon={<EyeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                            title="გამოაჩინეთ ისტორია"
                        >
                            ინტერაქტიული ვიზუალიზაცია საშუალებას გაძლევთ ნათლად დაინახოთ კავშირები თაობებს შორის.
                        </FeatureCard>
                        <FeatureCard 
                            icon={<ChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                            title="აღმოაჩინეთ სტატისტიკა"
                        >
                            გაიგეთ საინტერესო ფაქტები თქვენი ოჯახის შესახებ, როგორიცაა სახელების პოპულარობა, სქესობრივი ბალანსი და სხვა.
                        </FeatureCard>
                        <FeatureCard 
                            icon={<ShareIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                            title="გააზიარეთ უსაფრთხოდ"
                        >
                            დაშიფრეთ თქვენი ხე პაროლით და გაუზიარეთ ის ოჯახის წევრებსა და მეგობრებს სრული კონფიდენციალურობით.
                        </FeatureCard>
                    </div>
                </div>
            </section>

             {/* Call to Action Section */}
            <section className="bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        <span className="block">დაიწყეთ თქვენი ისტორიის აღმოჩენა</span>
                        <span className="block text-purple-600 dark:text-purple-400">დღესვე.</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600 dark:text-gray-300">
                        დარეგისტრირდით უფასოდ და შექმენით თქვენი ოჯახის უნიკალური მემკვიდრეობა.
                    </p>
                    <button
                        onClick={handleLogin}
                        className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 sm:w-auto transition-transform transform hover:scale-105"
                    >
                        დაწყება
                    </button>
                </div>
            </section>


            {/* Footer */}
            <footer className="w-full text-center py-6 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm">
                 <p>© {new Date().getFullYear()} გენეალოგიური ხე. ყველა უფლება დაცულია. შექმნილია <a href="https://bit.ly/av-ma" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">avma</a>-ს მიერ.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
